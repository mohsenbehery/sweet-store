import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsDto } from './dtos/products.dto';
import { AuthGuard } from 'src/users/auth.guard';
import { AuthbakerGuard } from './auth.baker.guard';
import { Serialize } from 'src/interceptors/serializeInterceptor';
import { ProductResDto } from './dtos/products.res.dto';
import { ProductPopResDto } from './dtos/products.pop.res';
import { Product } from 'src/schema/products.model';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @UseGuards(AuthbakerGuard)
  @Serialize(ProductPopResDto)
  @Post()
  async createProduct(
    @Body() product: ProductsDto,
    @Request() request: Request,
  ) {
    return await this.productsService.createProduct(product, request);
  }
  @UseGuards(AuthGuard)
  @Serialize(ProductPopResDto)
  @Get()
  @CacheKey('products')
  async getAllProducts() {
    return await this.productsService.getAllProducts();
  }
  @UseGuards(AuthGuard)
  @Patch()
  @Serialize(ProductPopResDto)
  async getProductByQuery(@Query() query: string) {
    return await this.productsService.getProductsByCategory(query);
  }
  @UseGuards(AuthbakerGuard)
  @Serialize(ProductResDto)
  @Get('/mine')
  async getMyProduct(@Request() request: Request) {
    return await this.productsService.getMyProduct(request);
  }
  @UseGuards(AuthGuard)
  @Serialize(ProductPopResDto)
  @Get('/:id')
  async getProductById(@Param('id') productId: string) {
    return await this.productsService.getProductById(productId);
  }

  @UseGuards(AuthbakerGuard)
  @Serialize(ProductResDto)
  @Patch('/:id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() attrs: Partial<Product>,
    @Request() request: Request,
  ) {
    return await this.productsService.updateProduct(productId, attrs, request);
  }
  @UseGuards(AuthbakerGuard)
  @Delete('/:id')
  async deleteProduct(
    @Param('id') productId: string,
    @Request() request: Request,
  ) {
    return await this.productsService.deleteProduct(productId, request);
  }
}
