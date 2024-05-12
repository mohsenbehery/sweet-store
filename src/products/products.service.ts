import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from 'src/schema/products.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductsDto } from './dtos/products.dto';
import { Baker } from 'src/schema/bakers.model';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('CACHE_MANAGER') private CacheManager: Cache,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Baker.name) private bakerModel: Model<Baker>,
  ) {}
  async createProduct(product: ProductsDto, req) {
    const bakerId = req.user.id;
    const newProduct = await this.productModel.create(product);
    newProduct.bakerId = bakerId;
    await newProduct.save();

    const baker = await this.bakerModel.findById(bakerId);
    baker.myProducts.push(newProduct._id.toString());
    await baker.save();

    return newProduct.populate('bakerId');
  }
  async getProductById(id: string) {
    const product = await this.productModel
      .findOne({ _id: id })
      .populate('bakerId');
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
  async getById(id: string) {
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getMyProduct(req) {
    const userId = req['user'].id;
    const baker = await this.bakerModel.findById(userId).populate('myProducts');
    return baker.myProducts;
  }
  async getAllProducts() {
    const product = await this.productModel.find().populate('bakerId');
    return product;
  }
  async getProductsByCategory(query: string) {
    return await this.productModel.find().where(query).populate('bakerId');
  }
  async updateProduct(id: string, attrs: Partial<Product>, request) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!request['user'].id === product.id) {
      throw new BadRequestException('You Are Not Allowed To');
    }
    const updatedProduct = { ...product.toObject(), ...attrs };
    const result = await this.productModel.findByIdAndUpdate(
      id,
      updatedProduct,
      {
        new: true,
      },
    );

    return result;
  }
  async deleteProduct(id: string, request) {
    const product = await this.getById(id);

    if (!product) {
      throw new NotFoundException('Product not found or valid id');
    }

    if (request['user'].id !== product.bakerId.toString()) {
      throw new BadRequestException(
        'You are not allowed to delete this product',
      );
    }

    await product.deleteOne();

    const baker = await this.bakerModel.findById(product.bakerId);

    const index = baker.myProducts.indexOf(id);
    if (index !== -1) {
      baker.myProducts.splice(index, 1);
      await baker.save();
    }

    return product;
  }
}
