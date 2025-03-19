import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../../../utils/constants/environmentType';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

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
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate the payload', () => {
    const payload = {
      id: '<_USER_UUID_>',
      first_name: 'John',
      last_name: 'Wick',
    };
    expect(jwtStrategy.validate(payload)).toEqual(payload);
  });
});
