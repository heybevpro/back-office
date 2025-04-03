import { DatabaseClientExceptionFilter } from './database-client-expection.filter';
import { QueryFailedError } from 'typeorm';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DriverError } from '../interfaces/ error/error.interface';

describe('DatabaseClientExceptionFilter', () => {
  let filter: DatabaseClientExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    filter = new DatabaseClientExceptionFilter();

    mockRequest = {
      url: '/test-url',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    } as unknown as jest.Mocked<ArgumentsHost>;
  });

  it('should return an error response with status 500', () => {
    const exception = new QueryFailedError(
      'INVALID SQL QUERY',
      [],
      new Error() as Error & DriverError,
    );
    exception.driverError.detail = 'Test detail';

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.stringMatching(
        new RegExp(`^${new Date().toISOString().split('T')[0]}`),
      ) as unknown as string,
      path: mockRequest.url,
      message: exception.message,
      detail: exception.driverError.detail,
    });
  });
});
