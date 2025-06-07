import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import * as Sentry from '@sentry/node';
import { GrpcStatusCode } from './grpc-status-code';

@Catch()
export class AllToHttpExceptionsFilter implements ExceptionFilter {
  private logger = new LoggerService({ context: AllToHttpExceptionsFilter.name });

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let details: any = undefined;

    // Handle RpcException from gRPC services
    if (exception instanceof RpcException) {
      const error = exception.getError();
      ({ status, message, details } = this.mapGrpcErrorToHttp(error));
    }
    // Handle direct gRPC errors
    else if (exception.code !== undefined && Object.values(GrpcStatusCode).includes(exception.code)) {
      ({ status, message, details } = this.mapGrpcErrorToHttp(exception));
    }
    // Handle HttpExceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        details = (errorResponse as any).details;
      } else {
        message = (errorResponse as string) || exception.message;
      }
    }
    // Handle any other exceptions
    else {
      message = exception.message || 'Unknown error';
      details = exception.stack;

      // Send to Sentry for unexpected errors
      try {
        Sentry.captureException(exception);
      } catch (e) {
        this.logger.warn(`Sentry is not available, error not captured: ${JSON.stringify(exception)}`);
      }
    }

    // Log the error
    this.logger.error(`HTTP error: ${message}`, JSON.stringify({ status, details, originalError: exception }));

    // Send the response
    response.status(status).json({
      errorCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  private mapGrpcErrorToHttp(error: any): { status: HttpStatus; message: string; details?: string } {
    // Map gRPC status codes to HTTP status codes
    const statusMap: Record<GrpcStatusCode, HttpStatus> = {
      [GrpcStatusCode.OK]: HttpStatus.OK,
      [GrpcStatusCode.CANCELLED]: HttpStatus.REQUEST_TIMEOUT,
      [GrpcStatusCode.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
      [GrpcStatusCode.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
      [GrpcStatusCode.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
      [GrpcStatusCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
      [GrpcStatusCode.ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [GrpcStatusCode.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [GrpcStatusCode.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
      [GrpcStatusCode.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_FAILED,
      [GrpcStatusCode.ABORTED]: HttpStatus.CONFLICT,
      [GrpcStatusCode.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
      [GrpcStatusCode.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
      [GrpcStatusCode.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
      [GrpcStatusCode.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [GrpcStatusCode.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
      [GrpcStatusCode.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
    };

    const status = statusMap[error.code] || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'gRPC service error';
    const details = error.details || error.stack;

    // Only send specific errors to Sentry
    // Skip common client errors like NOT_FOUND, INVALID_ARGUMENT, etc.
    const nonReportableStatuses = [
      HttpStatus.BAD_REQUEST,
      HttpStatus.NOT_FOUND,
      HttpStatus.CONFLICT,
      HttpStatus.FORBIDDEN,
      HttpStatus.UNAUTHORIZED,
    ];

    if (!nonReportableStatuses.includes(status)) {
      try {
        Sentry.captureException(error);
      } catch (e) {
        this.logger.warn(`Sentry is not available, error not captured: ${JSON.stringify(error)}`);
      }
    }

    return { status, message, details };
  }
}
