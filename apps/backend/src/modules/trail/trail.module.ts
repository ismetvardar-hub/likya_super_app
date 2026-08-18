import { Module } from '@nestjs/common';
import { TrailService } from './trail.service';
import { TrailController } from './trail.controller';
import { GpxParser } from './gpx.parser';

@Module({
  controllers: [TrailController],
  providers: [TrailService, GpxParser],
})
export class TrailModule {}
