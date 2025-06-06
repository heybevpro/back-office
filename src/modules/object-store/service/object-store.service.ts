import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { S3UploadFailedException } from '../../../excpetions/objects.exception';

@Injectable()
export class ObjectStoreService {
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
    const allowedMimeTypes = ['application/pdf', 'image/jpeg'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    const key = `documents/${organizationId}/${venueId}/${employeeId}/${uuidv4()}-${file.originalname}`;

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

      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      return fileUrl;
    } catch (error: unknown) {
      throw new S3UploadFailedException((error as Error).message);
    }
  }
}
