import {
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../excpetions/credentials.exception';
import { CredentialsStrategy } from './credentials.strategy';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { AuthenticationService } from '../service/authentication.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ImATeapotException } from '@nestjs/common';

describe('Credentials Authentication Strategy', () => {
  let strategy: CredentialsStrategy;
  let authService: AuthenticationService;
  const mockUser = {
    id: 'VALID_UUID',
    first_name: 'John',
    last_name: 'Doe',
    email: 'valid@email.com',
    password: `$PASSWORD_HASH`,
    created_at: new Date(),
  };
  const mockAuthenticationService = {
    validateUser: jest.fn(
      (loginRequestDto: LoginRequestDto): Promise<SuccessfulLoginResponse> => {
        if (loginRequestDto.email === 'valid@email.com')
          return Promise.resolve({ access_token: 'VALID_JWT', ...mockUser });
        throw new UserNotFoundException();
      },
    ),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsStrategy,
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    }).compile();
    strategy = module.get<CredentialsStrategy>(CredentialsStrategy);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });
  it('should return an UnauthorizedException when invalid email is submitted', async () => {
    await expect(
      strategy.validate('INVALID_EMAIL', 'VALID_PASSWORD'),
    ).rejects.toThrow(InvalidUserCredentialsException);
    jest.spyOn(authService, 'validateUser');

    expect(mockAuthenticationService.validateUser).toHaveBeenCalledTimes(1);
  });
  it('should throw other types of exceptions, if encountered', async () => {
    mockAuthenticationService.validateUser.mockRejectedValue(
      new ImATeapotException(),
    );
    await expect(
      strategy.validate('valid@email.com', 'VALID_PASSWORD'),
    ).rejects.toThrow(ImATeapotException);
  });
});
