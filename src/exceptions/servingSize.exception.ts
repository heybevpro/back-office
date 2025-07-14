import { ConflictException, NotFoundException } from '@nestjs/common';

export class ServingSizeConflictException extends ConflictException {
  constructor(label: string) {
    super(
      `A serving size with label '${label}' already exists for this organization.`,
    );
  }
}

export class ServingSizeOrganizationNotFoundException extends NotFoundException {
  constructor(orgId: number) {
    super(`Organization with ID ${orgId} not found.`);
  }
}
