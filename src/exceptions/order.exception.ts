import { BadRequestException } from '@nestjs/common';

export class OutOfStockException extends BadRequestException {
  constructor(productName: string) {
    super(`Product with name ${productName} is out of stock.`);
  }
}

export class InsufficientStockException extends BadRequestException {
  constructor(productName: string) {
    super(`Product with name ${productName} does not have enough stock.`);
  }
}
