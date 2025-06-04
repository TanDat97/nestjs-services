import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

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
      this.logger.error(`gRPC error in ${this.serviceName}.${method}:`, JSON.stringify(err));
      throw err;
    }
  }
}
