import { Test, TestingModule } from '@nestjs/testing';
import { ObjectStoreService } from './objectStore.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

const s3Mock = mockClient(S3Client);

describe('ObjectStoreService', () => {
  let service: ObjectStoreService;

  beforeEach(async () => {
    s3Mock.reset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectStoreService],
    }).compile();

    service = module.get<ObjectStoreService>(ObjectStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
    };

    it('should throw BadRequestException when file is not provided', async () => {
      await expect(
        service.uploadDocument(
          null as unknown as {
            buffer: Buffer;
            mimetype: string;
            originalname: string;
          },
          'organizationId',
          'venueId',
          'employeeId',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when organizationId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, '', 'venueId', 'employeeId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when venueId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, 'organizationId', '', 'employeeId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when employeeId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, 'organizationId', 'venueId', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload a document and return the S3 key', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const result = await service.uploadDocument(
        mockFile,
        'organizationId',
        'venueId',
        'employeeId',
      );

      expect(result).toBe(
        'documents/organizationId/venueId/employeeId/mocked-uuid-test.pdf',
      );

      expect(s3Mock.calls()[0].args[0].input).toEqual({
        Bucket: process.env.S3_BUCKET_NAME || 'bevpro-development',
        Key: 'documents/organizationId/venueId/employeeId/mocked-uuid-test.pdf',
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
      });
    });

    it('should log and throw InternalServerErrorException when upload fails', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 failure'));

      await expect(
        service.uploadDocument(
          mockFile,
          'organizationId',
          'venueId',
          'employeeId',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
