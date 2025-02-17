import { Transport } from '@nestjs/microservices';
import { AuthModule } from './app.module';
import { bootstrap } from '@libs/shared/microservices/start';
import { protobufPackage } from './proto/auth.pb';
import { join } from 'path';

const grpc = {
  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${process.env.GRPC_PORT}`,
    package: protobufPackage,
    protoPath: join('node_modules/grpc-nestjs-proto/proto/auth.proto'),
  },
};

bootstrap(AuthModule, grpc);
