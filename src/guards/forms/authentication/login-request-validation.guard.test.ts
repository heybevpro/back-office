import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { LoginRequestValidationGuard } from './login-request-validation.guard';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

jest.mock('class-validator', () => {
  return {
    ...jest.requireActual<object>('class-validator'),
    validate: jest.fn(),
  };
});

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(),
}));

describe('LoginRequestValidationGuard', () => {
  let guard: LoginRequestValidationGuard;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    guard = new LoginRequestValidationGuard();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    };
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if the request body passes validation', async () => {
    const validLoginDto = {
      email: 'valid@example.com',
      password: 'StrongPass123',
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ body: validLoginDto }),
    });

    (plainToInstance as jest.Mock).mockReturnValue(validLoginDto);
    (validate as jest.Mock).mockResolvedValue([]); // No validation errors

    const result = await guard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(plainToInstance).toHaveBeenCalled();
    expect(validate).toHaveBeenCalledWith(validLoginDto);
    expect(result).toBe(true);
  });

  it('should throw BadRequestException if the request body fails validation', async () => {
    const invalidLoginDto = {
      email: 'invalid-email',
      password: '',
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ body: invalidLoginDto }),
    });

    const validationErrors = [
      { property: 'email', constraints: { isEmail: 'email must be an email' } },
      {
        property: 'password',
        constraints: { isNotEmpty: 'password should not be empty' },
      },
    ];

    (plainToInstance as jest.Mock).mockReturnValue(invalidLoginDto);
    (validate as jest.Mock).mockResolvedValue(validationErrors);

    await expect(
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(BadRequestException);

    expect(plainToInstance).toHaveBeenCalled();
    expect(validate).toHaveBeenCalledWith(invalidLoginDto);
  });
});
