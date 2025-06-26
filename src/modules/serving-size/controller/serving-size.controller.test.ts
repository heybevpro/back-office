import { Test, TestingModule } from '@nestjs/testing';
import { ServingSizeController } from './serving-size.controller';
import { ServingSizeService } from '../service/serving-size.service';
import { CreateServingSizeDto } from '../dto/create-serving-size.dto';
import { ServingSize } from '../entity/serving-size.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { Organization } from '../../organization/entity/organization.entity';
import { ProductType } from 'src/modules/product-type/entity/product-type.entity';

describe('ServingSizeController', () => {
  let controller: ServingSizeController;
  let service: ServingSizeService;

  const mockServingSize: ServingSize = {
    id: 'uuid-123',
    label: 'Small',
    volume_in_ml: 150,
    organization: { id: 1 } as Organization,
    product_type: { id: 'product-type-uuid' } as ProductType,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockServingSizeService = {
    create: jest.fn(),
    findAllByOrganization: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServingSizeController],
      providers: [
        {
          provide: ServingSizeService,
          useValue: mockServingSizeService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // bypass auth guard
      .compile();

    controller = module.get<ServingSizeController>(ServingSizeController);
    service = module.get<ServingSizeService>(ServingSizeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateServingSizeDto = {
        label: 'Small',
        volume_in_ml: 150,
        organization: 1,
      };

      mockServingSizeService.create.mockResolvedValue(mockServingSize);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockServingSize);
    });
  });

  describe('findByOrganization', () => {
    it('should call service.findAllByOrganization with correct param and return result', async () => {
      const organizationId = 1;
      const mockList = [mockServingSize];

      mockServingSizeService.findAllByOrganization.mockResolvedValue(mockList);

      const result = await controller.findByOrganization(organizationId);

      expect(service.findAllByOrganization).toHaveBeenCalledWith(
        organizationId,
      );
      expect(result).toEqual(mockList);
    });
  });
});
