import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ValidateRequest,
  ValidateResponse,
} from './auth.pb';
import { GrpcClientService } from '../grpc-client.service';

@Injectable()
export class AuthGrpcService extends GrpcClientService {
  constructor(@Inject(AUTH_SERVICE_NAME) client: ClientGrpc) {
    super(client, AUTH_SERVICE_NAME);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.call<RegisterResponse, RegisterRequest>('register', data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.call<LoginResponse, LoginRequest>('login', data);
  }

  async validate(data: ValidateRequest): Promise<ValidateResponse> {
    return this.call<ValidateResponse, ValidateRequest>('validate', data);
  }
}
