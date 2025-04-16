import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../../../utils/constants/environmentType';
import { VerifiedJwtPayload } from '../../../../utils/constants/auth.constants';
import { Role } from '../../../../utils/constants/role.constants';
import { AuthenticationService } from '../../service/authentication.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const mockAuthenticationService = {
    validateUserJwt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
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

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate the payload', async () => {
    const payload: VerifiedJwtPayload = {
      id: '<_USER_UUID_>',
      first_name: 'John',
      last_name: 'Wick',
      email: '<_USER-EMAIL_>',
      role: Role.MANAGER,
      iat: 100000,
      exp: 100000,
    };
    await jwtStrategy.validate(payload);
    expect(mockAuthenticationService.validateUserJwt).toHaveBeenCalledWith(
      payload,
    );
  });
});
