import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { ObjectStoreService } from './object-store.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

const s3Mock = mockClient(S3Client);

describe('ObjectStoreService', () => {
  let service: ObjectStoreService;
  const mockOrganizationId = '<_ORGANIZATION-ID_>';
  const mockVenueId = '<_VENUE-ID_>';
  const mockEmployeeId = '<_EMPLOYEE-ID_>';

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
      const file = null;
      await expect(
        service.uploadDocument(
          file as never,
          mockOrganizationId,
          mockVenueId,
          mockEmployeeId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when mockOrganizationId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, '', mockVenueId, mockEmployeeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when mockVenueId is missing', async () => {
      await expect(
        service.uploadDocument(
          mockFile,
          mockOrganizationId,
          '',
          mockEmployeeId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when mockEmployeeId is missing', async () => {
      await expect(
        service.uploadDocument(mockFile, mockOrganizationId, mockVenueId, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload a document and return the S3 key', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const result = await service.uploadDocument(
        mockFile,
        mockOrganizationId,
        mockVenueId,
        mockEmployeeId,
      );

      const expectedKey = `documents/${mockOrganizationId}/${mockVenueId}/${mockEmployeeId}/mocked-uuid-test.pdf`;

      expect(result).toBe(expectedKey);

      const [putCommand] = s3Mock.commandCalls(PutObjectCommand);

      expect(putCommand.args[0].input).toEqual({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: expectedKey,
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
      });
    });

    it('should log and throw InternalServerErrorException when upload fails', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 failure'));

      await expect(
        service.uploadDocument(
          mockFile,
          mockOrganizationId,
          mockVenueId,
          mockEmployeeId,
        ),
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
          mockOrganizationId,
          mockVenueId,
          mockEmployeeId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow file type: pdf', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const pdfFile = {
        buffer: Buffer.from('pdf content'),
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      };

      const result = await service.uploadDocument(
        pdfFile,
        mockOrganizationId,
        mockVenueId,
        mockEmployeeId,
      );

      expect(result).toContain('test.pdf');
    });

    it('should allow file type: docx', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const docxFile = {
        buffer: Buffer.from('docx content'),
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'test.docx',
      };

      const result = await service.uploadDocument(
        docxFile,
        mockOrganizationId,
        mockVenueId,
        mockEmployeeId,
      );

      expect(result).toContain('test.docx');
    });

    it('should allow file type: jpg', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const jpgFile = {
        buffer: Buffer.from('jpg content'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      };

      const result = await service.uploadDocument(
        jpgFile,
        mockOrganizationId,
        mockVenueId,
        mockEmployeeId,
      );

      expect(result).toContain('test.jpg');
    });
  });
});
