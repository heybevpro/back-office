import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  const mockedLoginResponse: SuccessfulLoginResponse = {
    access_token: 'token',
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'test@example.com',
    created_at: new Date(),
  };

  const mockAuthenticationService = {
    validateUser: jest.fn((loginRequestDto: LoginRequestDto) => {
      if (
        loginRequestDto.email === 'test@example.com' &&
        loginRequestDto.password === 'VALID_PASSWORD'
      ) {
        return Promise.resolve(mockedLoginResponse);
      }
      throw new InvalidUserCredentialsException();
    }),
    register: jest.fn((createUserDto: CreateUserDto) => {
      return Promise.resolve({
        id: '<_AUTO_UUID_>',
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
      });
    }),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request: Request & { user: SuccessfulLoginResponse } = context
        .switchToHttp()
        .getRequest();
      request.user = mockedLoginResponse;
      return true;
    }),
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthenticationService },
      ],
    })
      .overrideGuard(AuthGuard('local'))
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthenticationService.signIn with correct parameters', async () => {
      const mockRequest = {
        user: {
          email: 'test@example.com',
          password: '<_VALID_PASSWORD_>',
        },
      };

      const result = await controller.login(mockRequest);
      expect(result).toEqual({
        email: 'test@example.com',
        password: '<_VALID_PASSWORD_>',
      });
    });
  });

  describe('create user', () => {
    const mockCreateUserDto: CreateUserDto = {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'newuser@example.com',
      password: '<_PASSWORD_>',
    };
    it('should return the created user', async () => {
      expect(await controller.register(mockCreateUserDto)).toEqual({
        id: '<_AUTO_UUID_>',
        first_name: mockCreateUserDto.first_name,
        last_name: mockCreateUserDto.last_name,
        email: mockCreateUserDto.email,
      });
      expect(mockAuthenticationService.register).toHaveBeenCalledWith(
        mockCreateUserDto,
      );
    });
  });
});
