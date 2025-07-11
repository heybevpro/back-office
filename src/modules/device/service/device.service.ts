import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { VenueService } from '../../venue/service/venue.service';
import {
  DeviceConflictException,
  VenueNotFoundException,
} from '../../../exceptions/device.exception';
import { AuthenticationService } from '../../authentication/service/authentication.service';
import { UserService } from '../../user/service/user.service';
import { DeviceResponse } from 'src/config/device.configuration';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly venueService: VenueService,
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateDeviceDto): Promise<Device> {
    const existingDevice = await this.deviceRepository.findOne({
      where: { id: dto.id },
    });

    if (existingDevice) {
      throw new DeviceConflictException(dto.id);
    }

    const venue = await this.venueService.findOneById(dto.venue);

    if (!venue) {
      throw new VenueNotFoundException(dto.venue);
    }

    try {
      return await this.deviceRepository.save(
        this.deviceRepository.create({ ...dto, venue: { id: dto.venue } }),
      );
    } catch (err: unknown) {
      throw new BadRequestException(err, {
        cause: err,
      });
    }
  }

  async findAllDevicesByVenue(venueId: number): Promise<Device[]> {
    return await this.deviceRepository.find({
      where: { venue: { id: venueId } },
      relations: { venue: { organization: true } },
    });
  }

  async findById(id: string, user: { id: string }): Promise<DeviceResponse> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: { venue: { organization: true } },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const userDetails = await this.userService.findOneById(user.id);
    const sanitizedUserData = {
      id: userDetails.id,
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      role: userDetails.role?.role_name,
      organization: userDetails.organization?.name ?? '',
    };
    const access_token =
      await this.authenticationService.generateAccessToken(sanitizedUserData);
    return {
      device,
      user: {
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        role: userDetails.role?.role_name ?? '',
        email: userDetails.email,
      },
      access_token,
    };
  }
}
