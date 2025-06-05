import { ConflictException, NotFoundException } from '@nestjs/common';

export class DeviceConflictException extends ConflictException {
  constructor(deviceId: string) {
    super(`Device with serial number ${deviceId} is already registered.`);
  }
}

export class VenueNotFoundException extends NotFoundException {
  constructor(venueId: number) {
    super(`Venue with ID ${venueId} not found.`);
  }
}
