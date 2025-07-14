import { ServiceUnavailableException } from '@nestjs/common';

export class S3UploadFailedException extends ServiceUnavailableException {
  constructor(details?: string) {
    super(`Document upload to S3 failed. ${details ?? ''}`);
  }
}
