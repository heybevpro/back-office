import { UnprocessableEntityException } from '@nestjs/common';

export class FailedToCreateMenuItemIngredients extends UnprocessableEntityException {
  constructor(e: unknown) {
    super(e, `Failed to save menu item ingredients`);
  }
}

export class FailedToCreateMenuItem extends UnprocessableEntityException {
  constructor(e: unknown) {
    super(e, `Failed to save menu item`);
  }
}
