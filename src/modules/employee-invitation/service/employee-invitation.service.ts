import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';
import { EmailService } from '../../email/service/email.service';
import { Status } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';

@Injectable()
export class EmployeeInvitationService {
  constructor(
    @InjectRepository(EmployeeInvitation)
    private readonly employeeInvitationRepository: Repository<EmployeeInvitation>,

    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,

    private readonly emailService: EmailService,
  ) {}

  generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateUniquePinForVenue(
    venueId: number,
    repository: Repository<EmployeeInvitation>,
    maxAttempts = 5,
  ): Promise<string> {
    let attempt = 0;

    while (attempt < maxAttempts) {
      const pin = this.generatePin();

      const existing = await repository.findOne({
        where: {
          pin,
          venue: { id: venueId },
        },
      });

      if (!existing) return pin;

      attempt++;
    }

    throw new Error('Failed to generate unique PIN for venue');
  }

  async create(
    createEmployeeInvitationDto: CreateEmployeeInvitationDto,
  ): Promise<EmployeeInvitation> {
    const { email, venue } = createEmployeeInvitationDto;

    try {
      const existingInvitation =
        await this.employeeInvitationRepository.findOne({
          where: { email },
        });

      if (existingInvitation && existingInvitation.status !== Status.Rejected) {
        throw new BadRequestException('Invitation already exists');
      }

      const uniquePin = await this.generateUniquePinForVenue(
        venue,
        this.employeeInvitationRepository,
      );

      const organization = await this.venueRepository.findOneOrFail({
        where: { id: venue },
      });

      await this.emailService.sendEmployeeInvitationEmail(
        email,
        uniquePin,
        organization.name,
      );

      const employeeInvite = this.employeeInvitationRepository.create({
        ...createEmployeeInvitationDto,
        pin: uniquePin,
        venue: { id: venue },
      });
      return await this.employeeInvitationRepository.save(employeeInvite);
    } catch (err) {
      throw new BadRequestException(err, {
        cause: err,
      });
    }
  }
}
