import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { DriverError } from '../interfaces/ error/error.interface';

@Catch(QueryFailedError)
export class DatabaseClientExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError<Error & DriverError>, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      detail: exception.driverError.detail,
    };
    response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }
}
