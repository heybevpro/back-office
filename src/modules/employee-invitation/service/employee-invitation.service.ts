import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';
import { EmailService } from '../../email/service/email.service';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { VenueService } from '../../venue/service/venue.service';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { ObjectStoreService } from '../../object-store/service/object-store.service';

@Injectable()
export class EmployeeInvitationService {
  constructor(
    @InjectRepository(EmployeeInvitation)
    private readonly employeeInvitationRepository: Repository<EmployeeInvitation>,

    private readonly venueService: VenueService,
    private readonly emailService: EmailService,
    private readonly objectStoreService: ObjectStoreService,
  ) {}

  generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * @deprecated This system-generated PIN method will be replaced by user-provided PIN entry in the future.
   * Ensure client-side input validation and backend uniqueness checks when migrating.
   */
  async generateUniquePinForVenue(
    venueId: number,
    maxAttempts = 5,
  ): Promise<string> {
    let attempt = 0;

    while (attempt < maxAttempts) {
      const pin = this.generatePin();

      const existing = await this.employeeInvitationRepository.findOne({
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

      if (
        existingInvitation &&
        existingInvitation.status !== EmployeeInvitationStatus.Rejected
      ) {
        throw new BadRequestException('Invitation already exists');
      }

      const uniquePin = await this.generateUniquePinForVenue(venue);

      const fetchedVenue = await this.venueService.findOneById(venue);

      await this.emailService.sendEmployeeInvitationEmail(
        email,
        uniquePin,
        fetchedVenue.organization.name,
        fetchedVenue.name,
      );

      const employeeInvite = this.employeeInvitationRepository.create({
        ...createEmployeeInvitationDto,
        pin: uniquePin,
        venue: { id: venue },
      });
      return await this.employeeInvitationRepository.save(employeeInvite);
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Failed to create invitation', {
        cause: err,
      });
    }
  }

  async onboard(
    metadata: CreateEmployeeMetadataDto,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<EmployeeInvitation> {
    if (!file) {
      throw new BadRequestException('Uploaded document is required');
    }
    const invitation = await this.employeeInvitationRepository.findOneOrFail({
      where: { pin: metadata.pin },
    });
    if (invitation.status !== EmployeeInvitationStatus.Onboarding) {
      throw new BadRequestException(
        `Cannot onboard. Current status is '${invitation.status}'`,
      );
    }

    const venue = await this.venueService.findOneById(invitation.venue.id);
    const organizationId = venue.organization.id;

    let uploadedFileUrl: string;
    try {
      uploadedFileUrl = await this.objectStoreService.uploadDocument(
        file,
        organizationId.toString(),
        invitation.venue.id,
        invitation.id,
      );
    } catch (err) {
      throw new BadRequestException(err, {
        cause: err,
      });
    }

    invitation.userMetadata = metadata;
    invitation.documentUrl = uploadedFileUrl;
    invitation.status = EmployeeInvitationStatus.Review;

    try {
      return await this.employeeInvitationRepository.save(invitation);
    } catch (err) {
      throw new BadRequestException('Failed to save onboarding data', {
        cause: err,
      });
    }
  }
  async findAllByVenueId(venueId: number): Promise<EmployeeInvitation[]> {
    try {
      return this.employeeInvitationRepository.find({
        where: { venue: { id: venueId } },
        relations: { venue: true },
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch data', {
        cause: error,
      });
    }
  }
}
