import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CurrentUser, JwtAuthGuard, JwtUser } from '../../core/auth/jwt-auth.guard';
import { CreateMarketOrderDto } from './dto/marketplace.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get('products')
  products() {
    return this.marketplace.products();
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: JwtUser, @Body() dto: CreateMarketOrderDto) {
    return this.marketplace.createOrder(user.sub, dto);
  }
}
