import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  static formatResponse(response: Response<any>) {
    return {
      statusCode: response?.statusCode ?? 200,
      message: response?.['message'] ?? 'success',
      data: response?.['data'] ?? response,
      error: response?.['error'],
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((response) => ResponseTransformInterceptor.formatResponse(response)));
  }
}
