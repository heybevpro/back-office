import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ObjectStoreService } from './object-store.service';
import { S3UploadFailedException } from '../../../excpetions/objects.exception';

jest.mock('@aws-sdk/client-s3');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('ObjectStoreService', () => {
  let service: ObjectStoreService;
  let s3ClientSendMock: jest.Mock;

  const mockOrganizationId = '<_ORGANIZATION-ID_>';
  const mockVenueId = '<_VENUE-ID_>';
  const mockEmployeeId = '<_EMPLOYEE-ID_>';

  beforeEach(async () => {
    s3ClientSendMock = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: s3ClientSendMock,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectStoreService],
    }).compile();

    service = module.get<ObjectStoreService>(ObjectStoreService);
    process.env.S3_BUCKET_NAME = 'mock-bucket';
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

    it('should upload a document and return the S3 key', async () => {
      s3ClientSendMock.mockResolvedValue({});

      const result = await service.uploadDocument(
        mockFile,
        mockOrganizationId,
        mockVenueId,
        mockEmployeeId,
      );

      const expectedKey = `documents/${mockOrganizationId}/${mockVenueId}/${mockEmployeeId}/mocked-uuid-test.pdf`;

      expect(result).toBe(expectedKey);
      expect(s3ClientSendMock).toHaveBeenCalledTimes(1);

      const [putCommand] = s3ClientSendMock.mock.calls[0] as [PutObjectCommand];
      expect(putCommand).toBeInstanceOf(PutObjectCommand);
    });

    it('should log and throw S3UploadFailedException when upload fails', async () => {
      s3ClientSendMock.mockRejectedValue(
        new Error('Simulated S3 upload failure'),
      );

      await expect(
        service.uploadDocument(
          mockFile,
          mockOrganizationId,
          mockVenueId,
          mockEmployeeId,
        ),
      ).rejects.toThrow(S3UploadFailedException);
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
      s3ClientSendMock.mockResolvedValue({});

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
      s3ClientSendMock.mockResolvedValue({});

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
      s3ClientSendMock.mockResolvedValue({});

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

  describe('S3UploadFailedException', () => {
    it('should format the message with details', () => {
      const err = new S3UploadFailedException('Upload timed out');
      expect(err.message).toBe(
        'Document upload to S3 failed. Upload timed out',
      );
    });

    it('should format the message without details', () => {
      const err = new S3UploadFailedException();
      expect(err.message).toBe('Document upload to S3 failed. ');
    });
  });
});
