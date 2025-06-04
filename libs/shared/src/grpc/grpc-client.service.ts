import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { GrpcStatusCode } from '../filters/grpc-status-code';

@Injectable()
export class GrpcClientService {
  private serviceClient: any;
  private logger = new LoggerService({ context: GrpcClientService.name });

  constructor(
    @Inject('GRPC_CLIENT_TOKEN') private readonly client: ClientGrpc,
    private readonly serviceName: string,
  ) {
    this.serviceClient = this.client.getService(this.serviceName);
  }

  async call<TResult = any, TRequest = any>(method: string, data: TRequest): Promise<TResult> {
    try {
      if (!this.serviceClient[method]) {
        throw new Error(`Method ${method} not found in gRPC service ${this.serviceName}`);
      }

      const result = await firstValueFrom(this.serviceClient[method](data) as Observable<TResult>);

      return result;
    } catch (err) {
      // Log the complete error information with type and stack trace
      this.logger.error(`gRPC error in ${this.serviceName}.${method}: ${err.name}: ${err.message}`);

      // Process the error based on its type
      if (this.isGrpcError(err)) {
        // Convert gRPC error to RpcException with proper status code
        throw this.handleGrpcError(err, method);
      } else {
        // For non-gRPC errors, wrap in a generic RpcException with more details
        throw new RpcException({
          code: GrpcStatusCode.INTERNAL,
          message: `Internal error in ${this.serviceName}.${method}: ${err.name}: ${err.message || 'Unknown error'}`,
          details: err.stack,
        });
      }
    }
  }

  private isGrpcError(err: any): boolean {
    return err && typeof err.code === 'number' && Object.values(GrpcStatusCode).includes(err.code);
  }

  private handleGrpcError(err: any, method: string): RpcException {
    // Enhance error with additional context
    const enhancedError = {
      code: err.code,
      message: err.message || `Error in ${this.serviceName}.${method}`,
      details: err.details || err.stack,
      metadata: {
        ...(err.metadata || {}),
        errorName: err.name,
        serviceName: this.serviceName,
        methodName: method,
        timestamp: new Date().toISOString(),
      },
    };

    return new RpcException(enhancedError);
  }
}
