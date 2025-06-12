import { BadRequestException } from '@nestjs/common';

export class InvitationAlreadyExistsException extends BadRequestException {
  constructor(email: string) {
    super(`An active invitation already exists for email: ${email}`);
  }
}

export class InvalidInvitationStatusException extends BadRequestException {
  constructor(status: string) {
    super(`Invalid invitation status: '${status}'`);
  }
}

export class MissingDataException extends BadRequestException {
  constructor() {
    super(`Missing user metadata for accepted invitation`);
  }
}
