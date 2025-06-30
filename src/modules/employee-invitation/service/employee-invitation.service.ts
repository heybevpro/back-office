import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import {
  CreateEmployeeInvitationDto,
  LoginDto,
  UpdateInvitationStatusDto,
} from '../dto/employee-invitation.dto';
import { EmailService } from '../../email/service/email.service';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { VenueService } from '../../venue/service/venue.service';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { ObjectStoreService } from '../../object-store/service/object-store.service';
import { CreateEmployeeDto } from '../../employee/dto/create-employee.dto';
import { EmployeeService } from '../../employee/service/employee.service';
import {
  FailedToFetchInvitation,
  InvalidInvitationStatusException,
  InvitationAlreadyExistsException,
  MissingDataException,
} from '../../../excpetions/employee.exception';

@Injectable()
export class EmployeeInvitationService {
  constructor(
    @InjectRepository(EmployeeInvitation)
    private readonly employeeInvitationRepository: Repository<EmployeeInvitation>,
    private readonly employeeService: EmployeeService,
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

    const existingInvitation = await this.employeeInvitationRepository.findOne({
      where: { email },
      order: { created_at: 'DESC' },
    });

    if (
      existingInvitation &&
      existingInvitation.status !== EmployeeInvitationStatus.Rejected
    ) {
      throw new InvitationAlreadyExistsException(email);
    }

    const uniquePin = await this.generateUniquePinForVenue(venue);
    const fetchedVenue = await this.venueService.findOneById(venue);

    await this.emailService.sendEmployeeInvitationEmail(
      email,
      uniquePin,
      fetchedVenue.organization.name,
      fetchedVenue.name,
    );

    try {
      const employeeInvite = this.employeeInvitationRepository.create({
        ...createEmployeeInvitationDto,
        pin: uniquePin,
        venue: { id: venue },
      });
      return await this.employeeInvitationRepository.save(employeeInvite);
    } catch (err) {
      throw new BadRequestException('Failed to save employee invitation.', {
        cause: err,
      });
    }
  }

  async onboard(
    metadata: CreateEmployeeMetadataDto,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<EmployeeInvitation> {
    const invitation = await this.employeeInvitationRepository.findOneOrFail({
      where: { pin: metadata.pin },
      relations: { venue: true },
    });

    if (invitation.status !== EmployeeInvitationStatus.Onboarding) {
      throw new InvalidInvitationStatusException(invitation.status);
    }

    const venue = await this.venueService.findOneById(invitation.venue.id);
    const organizationId = venue.organization.id;

    const uploadedFileUrl = await this.objectStoreService.uploadDocument(
      file,
      organizationId.toString(),
      invitation.venue.id,
      invitation.id,
    );

    invitation.userMetadata = {
      ...metadata,
      document: uploadedFileUrl,
    };
    invitation.status = EmployeeInvitationStatus.Review;

    try {
      return await this.employeeInvitationRepository.save(invitation);
    } catch (err) {
      throw new BadRequestException('Failed to save onboarding data', {
        cause: err,
      });
    }
  }

  async updateStatusUsingVerification(
    dto: UpdateInvitationStatusDto,
  ): Promise<EmployeeInvitation> {
    const invitation = await this.employeeInvitationRepository.findOneOrFail({
      where: { id: dto.invitationId },
      relations: { venue: true },
    });

    if (invitation.status !== EmployeeInvitationStatus.Review) {
      throw new InvalidInvitationStatusException(invitation.status);
    }
    const applicationStatus = dto.verified
      ? EmployeeInvitationStatus.Accepted
      : EmployeeInvitationStatus.Rejected;
    await this.emailService.sendApplicationStatusEmail(
      invitation.email,
      applicationStatus,
    );

    if (!dto.verified) {
      invitation.status = EmployeeInvitationStatus.Rejected;
      return await this.employeeInvitationRepository.save(invitation);
    }

    if (!invitation.userMetadata || !invitation.userMetadata.document) {
      throw new MissingDataException();
    }

    const metadata = invitation.userMetadata;

    const createEmployeeDto: CreateEmployeeDto = {
      ...metadata,
      venue: invitation.venue.id,
      pin: invitation.pin,
      email: invitation.email,
      document: invitation.userMetadata.document,
    };

    try {
      await this.employeeService.create(createEmployeeDto, invitation);

      invitation.status = EmployeeInvitationStatus.Accepted;

      return await this.employeeInvitationRepository.save(invitation);
    } catch (err) {
      throw new BadRequestException(
        'Failed to create employee or update invitation',
        {
          cause: err,
        },
      );
    }
  }

  async findByInvitationPin(dto: LoginDto): Promise<EmployeeInvitation> {
    try {
      return await this.employeeInvitationRepository.findOneByOrFail({
        pin: dto.pin,
        venue: { id: dto.venue },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Employee Invitation not found for the provided PIN',
        );
      }
      throw error;
    }
  }

  async findAllByVenueId(venueId: number): Promise<EmployeeInvitation[]> {
    try {
      return this.employeeInvitationRepository.find({
        where: { venue: { id: venueId } },
        relations: { venue: true },
        order: { created_at: 'DESC' },
      });
    } catch {
      throw new FailedToFetchInvitation();
    }
  }

  async findInvitationId(invitationId: string): Promise<EmployeeInvitation> {
    try {
      return this.employeeInvitationRepository.findOneOrFail({
        where: { id: invitationId },
        relations: { venue: true },
      });
    } catch {
      throw new FailedToFetchInvitation();
    }
  }
}
