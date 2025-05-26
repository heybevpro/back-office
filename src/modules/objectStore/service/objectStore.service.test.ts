import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { ObjectStoreService } from './objectStore.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

const s3Mock = mockClient(S3Client);

describe('ObjectStoreService', () => {
  let service: ObjectStoreService;
  const organizationId = 'organizationId';
  const venueId = 'venueId';
  const employeeId = 'employeeId';

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
          organizationId,
          venueId,
          employeeId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when organizationId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, '', venueId, employeeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when venueId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, organizationId, '', employeeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when employeeId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, organizationId, venueId, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload a document and return the S3 key', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const result = await service.uploadDocument(
        mockFile,
        organizationId,
        venueId,
        employeeId,
      );

      expect(result).toBe(
        `documents/${organizationId}/${venueId}/${employeeId}/mocked-uuid-test.pdf`,
      );

      expect(s3Mock.calls()[0].args[0].input).toEqual({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `documents/${organizationId}/${venueId}/${employeeId}/mocked-uuid-test.pdf`,
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
      });
    });

    it('should log and throw InternalServerErrorException when upload fails', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 failure'));

      await expect(
        service.uploadDocument(mockFile, organizationId, venueId, employeeId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException for unsupported file type: text/plain', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'text/plain',
        originalname: 'test.txt',
      };

      await expect(
        service.uploadDocument(
          invalidFile,
          organizationId,
          venueId,
          employeeId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow file type: application/pdf', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const pdfFile = {
        buffer: Buffer.from('pdf content'),
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      };

      const result = await service.uploadDocument(
        pdfFile,
        organizationId,
        venueId,
        employeeId,
      );

      expect(result).toContain('test.pdf');
    });

    it('should allow file type: application/vnd.openxmlformats-officedocument.wordprocessingml.document', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const docxFile = {
        buffer: Buffer.from('docx content'),
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'test.docx',
      };

      const result = await service.uploadDocument(
        docxFile,
        organizationId,
        venueId,
        employeeId,
      );

      expect(result).toContain('test.docx');
    });

    it('should allow file type: image/jpeg', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const jpgFile = {
        buffer: Buffer.from('jpg content'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      };

      const result = await service.uploadDocument(
        jpgFile,
        organizationId,
        venueId,
        employeeId,
      );

      expect(result).toContain('test.jpg');
    });
  });
});
