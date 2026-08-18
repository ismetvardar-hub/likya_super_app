import { Body, Controller, Get, Post } from '@nestjs/common';
import { StkVirtualPosAdapter, MobilePosAdapter, applyStkDiscount } from '../../infrastructure/adapters/pos/stk-pos.adapter';
import type { PosChargeRequest, PosChargeResult } from '../../infrastructure/adapters/pos/stk-pos.adapter';
import type { BankTransferRequest } from '../../infrastructure/adapters/banking/open-banking.adapter';
import { openBankingAdapter } from '../../infrastructure/adapters/banking/open-banking.adapter';
import type { EInvoiceRequest } from '../../infrastructure/adapters/e-invoice/e-invoice.adapter';
import { eInvoiceAdapter } from '../../infrastructure/adapters/e-invoice/e-invoice.adapter';

/** Public REST yüzeyi — POS tahsilat + banka transfer + e-fatura (izole). */
@Controller('public/club-finance')
export class FinancePublicController {
  @Post('pos/charge')
  charge(@Body() dto: PosChargeRequest): Promise<PosChargeResult> {
    const adapter = dto.posType === 'mobile' ? new MobilePosAdapter() : new StkVirtualPosAdapter();
    return adapter.charge(dto);
  }

  @Post('banking/transfer')
  transfer(@Body() dto: BankTransferRequest) {
    return openBankingAdapter(dto.provider).transfer(dto);
  }

  @Post('invoice')
  sendInvoice(@Body() dto: EInvoiceRequest & { provider?: 'gib' | 'parashut' | 'uyumsoft' }) {
    const adapter = eInvoiceAdapter(dto.provider ?? 'gib');
    return adapter.sendInvoice(dto);
  }

  @Get('pos/stk-discount')
  stkDiscountTable() {
    return {
      amounts: [100, 250, 500, 1000].map((a) => {
        const d = applyStkDiscount(a, 10);
        return { grossTl: a, discountTl: d.discountTl, chargedTl: d.chargedTl };
      }),
      note: 'STK indirimli sanal POS — %10 örnek senaryo',
    };
  }
}
