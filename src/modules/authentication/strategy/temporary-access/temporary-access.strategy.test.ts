import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../../../utils/constants/environmentType';
import { TemporaryAccessJwtPayload } from '../../../../utils/constants/auth.constants';
import { AuthenticationService } from '../../service/authentication.service';
import { TemporaryAccessStrategy } from './temporary-access.strategy';

describe('TemporaryAccessStrategy', () => {
  let tempJwtAccessStrategy: TemporaryAccessStrategy;

  const mockAuthenticationService = {
    validateUserJwt: jest.fn(),
    validateTemporaryAccessJwt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemporaryAccessStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === EnvironmentVariable.JWT_SECRET.toString()) {
                return 'VALID_JWT_SECRET';
              }
              return null;
            }),
          },
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    }).compile();

    tempJwtAccessStrategy = module.get<TemporaryAccessStrategy>(
      TemporaryAccessStrategy,
    );
  });

  it('should be defined', () => {
    expect(tempJwtAccessStrategy).toBeDefined();
  });

  it('should validate the payload', async () => {
    const payload: TemporaryAccessJwtPayload = {
      id: '<_USER_UUID_>',
      email: '<_USER-EMAIL_>',
      iat: 100000,
      exp: 100000,
    };
    await tempJwtAccessStrategy.validate(payload);
    expect(
      mockAuthenticationService.validateTemporaryAccessJwt,
    ).toHaveBeenCalledWith(payload);
  });
});
