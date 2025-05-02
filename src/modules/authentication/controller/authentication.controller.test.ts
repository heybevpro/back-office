import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../user/entity/user.entity';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { PasswordResetEmailSentSuccessResponse } from '../../../utils/constants/api-response.constants';

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
    requestResetPassword: jest.fn(() => {
      return Promise.resolve(PasswordResetEmailSentSuccessResponse);
    }),
    validateResetPassword: jest.fn(),
    resetPassword: jest.fn(),
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

  describe('loggedInUser', () => {
    it('should fetch loggedIn user details from JWT', () => {
      const mockUserPayload = {
        user: {
          id: 'VALID-ID',
          email: 'test@example.com',
          password: '<_VALID_PASSWORD_>',
        } as User,
      };

      const result = controller.loggedInUserDetails(mockUserPayload);
      expect(result).toEqual(mockUserPayload.user);
    });
  });

  describe('request Password Reset', () => {
    it('should call AuthenticationService.requestPasswordReset with correct parameters', async () => {
      const mockResetPasswordDto: RequestPasswordResetDto = {
        email: 'someuser@email.com',
      };
      await controller.requestResetPassword(mockResetPasswordDto);
      expect(
        mockAuthenticationService.requestResetPassword,
      ).toHaveBeenCalledWith(mockResetPasswordDto.email);
    });
  });

  describe('validate password reset request', () => {
    it('should call AuthenticationService.validateResetPassword with correct parameters', async () => {
      const mockValidatePasswordResetDto = {
        rs: 'VALID_RESET_TOKEN',
      };
      await controller.validateResetPassword(mockValidatePasswordResetDto);
      expect(
        mockAuthenticationService.validateResetPassword,
      ).toHaveBeenCalledWith(mockValidatePasswordResetDto.rs);
    });
  });

  describe('reset password', () => {
    it('should call AuthenticationService.validateResetPassword with correct parameters', async () => {
      const mockRequest = {
        user: {
          id: 'VALID-ID',
        },
      };
      const mockResetPasswordDto = {
        updated_password: 'NEW_PASSWORD',
      };
      await controller.resetPassword(mockRequest, mockResetPasswordDto);
      expect(mockAuthenticationService.resetPassword).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockResetPasswordDto.updated_password,
      );
    });
  });
});
