# Exception Filters Usage Examples

## 1. gRPC Exception Filter for Microservices

### Import the filter in your microservice main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllGrpcExceptionsFilter } from '@libs/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'your.package.name',
        protoPath: 'path/to/your.proto',
      },
    },
  );

  // Apply the global exception filter
  app.useGlobalFilters(new AllGrpcExceptionsFilter());

  await app.listen();
}
bootstrap();
```

## 2. HTTP Exception Filter for API Gateways

### Import the filter in your HTTP application main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcToHttpExceptionsFilter } from '@libs/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply the global exception filter to handle gRPC errors in HTTP responses
  app.useGlobalFilters(new GrpcToHttpExceptionsFilter());
  
  await app.listen(3000);
}
bootstrap();
```

## 3. Using the GrpcClientService in your client applications

The `GrpcClientService` will automatically handle and transform gRPC errors:

```typescript
import { Injectable } from '@nestjs/common';
import { GrpcClientService } from '@libs/shared';

@Injectable()
export class YourService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async callGrpcMethod(data: any) {
    try {
      // The error handling is built into the GrpcClientService
      return await this.grpcClient.call('methodName', data);
    } catch (error) {
      // The error will be a properly formatted RpcException
      // with additional context and metadata
      throw error; // Will be caught by GrpcToHttpExceptionsFilter in HTTP apps
    }
  }
}
```

## 4. Error Types Handled

Both filters handle the following types of errors:

1. Standard gRPC errors with status codes
2. NestJS RpcExceptions
3. Generic errors (converted to appropriate status codes)

Each error type is properly logged and, if configured, sent to Sentry for monitoring.

## 5. HTTP Status Code Mapping

The `GrpcToHttpExceptionsFilter` maps gRPC status codes to HTTP status codes as follows:

| gRPC Status Code    | HTTP Status Code            |
|---------------------|----------------------------|
| OK                  | 200 OK                     |
| CANCELLED           | 499 CLIENT_CLOSED_REQUEST  |
| UNKNOWN             | 500 INTERNAL_SERVER_ERROR  |
| INVALID_ARGUMENT    | 400 BAD_REQUEST            |
| DEADLINE_EXCEEDED   | 504 GATEWAY_TIMEOUT        |
| NOT_FOUND           | 404 NOT_FOUND              |
| ALREADY_EXISTS      | 409 CONFLICT               |
| PERMISSION_DENIED   | 403 FORBIDDEN              |
| RESOURCE_EXHAUSTED  | 429 TOO_MANY_REQUESTS      |
| FAILED_PRECONDITION | 412 PRECONDITION_FAILED    |
| ABORTED             | 409 CONFLICT               |
| OUT_OF_RANGE        | 400 BAD_REQUEST            |
| UNIMPLEMENTED       | 501 NOT_IMPLEMENTED        |
| INTERNAL            | 500 INTERNAL_SERVER_ERROR  |
| UNAVAILABLE         | 503 SERVICE_UNAVAILABLE    |
| DATA_LOSS           | 500 INTERNAL_SERVER_ERROR  |
| UNAUTHENTICATED     | 401 UNAUTHORIZED           | 