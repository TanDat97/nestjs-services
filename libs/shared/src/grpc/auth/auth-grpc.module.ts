import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME } from './auth.pb';
import { AuthGrpcService } from './auth-grpc.service';
import { config } from '../../configs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: config.authGrpc,
          package: AUTH_PACKAGE_NAME,
          protoPath: 'node_modules/grpc-nestjs-proto/proto/auth.proto',
        },
      },
    ]),
  ],
  providers: [AuthGrpcService],
  exports: [AuthGrpcService],
})
export class AuthGrpcModule {}
