import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { S3UploadFailedException } from '../../../excpetions/objects.exception';

@Injectable()
export class ObjectStoreService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({ region: 'us-east-2' });
  }

  sanitizeFilename(originalname: string): string {
    const filename = originalname
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const match = filename.match(/^(.*?)(\.[^.]+)?$/);
    let name = match ? match[1] : filename;
    const ext = match && match[2] ? match[2] : '';

    name = name
      .replace(/[^\w-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/_+/g, '_')
      .replace(/^[-_]+|[-_]+$/g, '')
      .replace(/-+$/g, '');

    let sanitized = name + ext;
    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '');
    return sanitized;
  }

  async uploadDocument(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    organizationId: string,
    venueId: number,
    invitationId: string,
  ): Promise<string> {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const key = `documents/organization/${organizationId}/venue/${venueId}/invitations/${invitationId}/${uuidv4()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      const bucketName = process.env.S3_BUCKET_NAME;
      const region = 'us-east-2';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (error: unknown) {
      throw new S3UploadFailedException((error as Error).message);
    }
  }

  async uploadMenuItemImage(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    organizationId: string,
    venueId: number,
    menuItemId: string,
    menuItemName: string,
  ): Promise<string> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid image type: ${file.mimetype}`);
    }

    const key = `documents/organization/${organizationId}/venue/${venueId}/menuItem/${menuItemId}-${menuItemName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      const bucketName = process.env.S3_BUCKET_NAME;
      const region = 'us-east-2';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (error: unknown) {
      throw new S3UploadFailedException((error as Error).message);
    }
  }
}
