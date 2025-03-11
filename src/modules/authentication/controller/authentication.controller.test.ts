import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';

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
    signIn: jest.fn((loginRequestDto: LoginRequestDto) => {
      if (
        loginRequestDto.email === 'test@example.com' &&
        loginRequestDto.password === 'VALID_PASSWORD'
      ) {
        return Promise.resolve(mockedLoginResponse);
      }
      throw new InvalidUserCredentialsException();
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthenticationService },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthenticationService.signIn with correct parameters', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'VALID_PASSWORD',
      };
      await controller.login(loginRequestDto);
      expect(mockAuthenticationService.signIn).toHaveBeenCalledWith(
        loginRequestDto,
      );
    });

    it('should return the result from AuthenticationService.signIn', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'VALID_PASSWORD',
      };
      mockAuthenticationService.signIn.mockResolvedValue(mockedLoginResponse);

      const response = await controller.login(loginRequestDto);
      expect(response).toEqual(mockedLoginResponse);
    });

    it('should throw an exception if invalid data is submitted', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'INVALID_EMAIL',
        password: 'password',
      };
      mockAuthenticationService.signIn.mockRejectedValue(
        new InvalidUserCredentialsException(),
      );

      await expect(controller.login(loginRequestDto)).rejects.toThrow(
        InvalidUserCredentialsException,
      );
    });
  });
});
