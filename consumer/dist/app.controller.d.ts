import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    handleAcceptedOrders(data: string): void;
    handleRejectedOrders(data: string): void;
    handleFulfilledOrders(data: string): void;
}
