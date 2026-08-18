import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TrailService } from './trail.service';
import { CurrentUser, JwtAuthGuard, JwtUser } from '../../core/auth/jwt-auth.guard';
import { CreateSosDto, NearbyPoisQuery, UploadGpxDto } from './dto/trail.dto';

@Controller('trail')
@UseGuards(JwtAuthGuard)
export class TrailController {
  constructor(private readonly trail: TrailService) {}

  @Get('pois/nearby')
  nearby(@Query() query: NearbyPoisQuery) {
    return this.trail.nearbyPois(query);
  }

  @Post('gpx')
  upload(@Body() dto: UploadGpxDto, @CurrentUser() user: JwtUser) {
    return this.trail.uploadGpx(dto, user.sub);
  }

  @Get('tracks/:id')
  track(@Param('id') id: string) {
    return this.trail.getTrack(id);
  }

  @Post('sos')
  sos(@CurrentUser() user: JwtUser, @Body() dto: CreateSosDto) {
    return this.trail.createSos(user.sub, dto);
  }
}
