import { Transport } from '@nestjs/microservices';
import { AuthModule } from './app.module';
import { bootstrap } from '@libs/shared/microservices/start';
import { join } from 'path';
import { AUTH_PACKAGE_NAME, protobufPackage } from '@libs/shared/grpc/auth/auth.pb';

const grpc = {
  name: AUTH_PACKAGE_NAME,
  transport: Transport.GRPC,
  options: {
    port: process.env.GRPC_PORT,
    url: `0.0.0.0:${process.env.GRPC_PORT}`,
    package: protobufPackage,
    protoPath: join('node_modules/grpc-nestjs-proto/proto/auth.proto'),
  },
};

bootstrap(AuthModule, grpc);
