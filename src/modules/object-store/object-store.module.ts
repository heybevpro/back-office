import { Module } from '@nestjs/common';
import { ObjectStoreService } from './service/object-store.service';

@Module({
  providers: [ObjectStoreService],
  exports: [ObjectStoreService],
})
export class ObjectStoreModule {}
