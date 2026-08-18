import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUser, JwtAuthGuard, JwtUser } from '../../core/auth/jwt-auth.guard';
import { PayDto, RedeemCouponDto } from './dto/wallet.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  balance(@CurrentUser() user: JwtUser) {
    return this.wallet.balance(user.sub);
  }

  @Post('pay')
  pay(@CurrentUser() user: JwtUser, @Body() dto: PayDto) {
    return this.wallet.pay(user.sub, dto);
  }

  @Post('coupons/redeem')
  redeem(@CurrentUser() user: JwtUser, @Body() dto: RedeemCouponDto) {
    return this.wallet.redeemCoupon(user.sub, dto);
  }
}
