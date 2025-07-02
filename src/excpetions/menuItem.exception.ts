import { NotFoundException, BadRequestException } from '@nestjs/common';

export class ServingSizeOrganizationMismatchException extends NotFoundException {
  constructor(servingSizeId: string) {
    super(
      `Serving size ${servingSizeId} does not belong to the venue's organization`,
    );
  }
}

export class DuplicateMenuItemNameException extends BadRequestException {
  constructor(name: string) {
    super(`A menu item with the name '${name}' already exists for this venue.`);
  }
}
