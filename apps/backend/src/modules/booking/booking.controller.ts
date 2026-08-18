import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CurrentUser, JwtAuthGuard, JwtUser } from '../../core/auth/jwt-auth.guard';
import { AvailableQuery, CreateBookingDto } from './dto/booking.dto';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get('available')
  available(@Query() query: AvailableQuery) {
    return this.booking.available(query.type, query.date);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBookingDto) {
    return this.booking.create(user.sub, dto);
  }
}
