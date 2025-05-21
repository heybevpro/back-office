import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ObjectStoreService {
  private readonly logger = new Logger(ObjectStoreService.name);
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({ region: 'us-east-2' });
  }

  async uploadDocument(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    organizationId: string,
    venueId: string,
    employeeId: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!organizationId || !venueId || !employeeId) {
      throw new BadRequestException('Missing request fields');
    }

    const key = `documents/${organizationId}/${venueId}/${employeeId}/${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'bevpro-development',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      return key;
    } catch (error: unknown) {
      this.logger.error('Failed to upload document to S3', error);
      throw new InternalServerErrorException('Document upload failed');
    }
  }
}
