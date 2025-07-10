import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from '../entity/invitation.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateInvitationDto } from '../dto/create-invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  async create(createInvitationDto: CreateInvitationDto) {
    return await this.invitationRepository.save(
      this.invitationRepository.create(createInvitationDto),
    );
  }

  async fetchAll() {
    return await this.invitationRepository.find();
  }

  async fetchById(id: number) {
    return await this.invitationRepository.findOne({ where: { id } });
  }
}
