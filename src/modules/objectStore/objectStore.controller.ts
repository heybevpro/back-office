import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectStoreService } from './service/objectStore.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Controller('objectStore')
export class ObjectStoreController {
  constructor(private readonly objectStoreService: ObjectStoreService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async testUpload(
    @UploadedFile() file: UploadedFile,
    @Body()
    body: { organizationId: string; venueId: string; employeeId: string },
  ) {
    const { organizationId, venueId, employeeId } = body;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.objectStoreService.uploadDocument(
      file,
      organizationId,
      venueId,
      employeeId,
    );
    return { key: result };
  }
}
