import { NotFoundException } from '@nestjs/common';

export class ServingSizeOrganizationMismatchException extends NotFoundException {
  constructor(servingSizeId: string) {
    super(
      `Serving size ${servingSizeId} does not belong to the venue's organization`,
    );
  }
}
