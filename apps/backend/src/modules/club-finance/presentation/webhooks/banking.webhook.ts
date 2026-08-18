import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { normalizeBankingWebhook, verifyWebhookSignature, type BankingWebhookPayload, type NormalizedBankingEvent } from '../../infrastructure/adapters/banking/banking-webhook.adapter';

/** Gelen banka webhook'ları — imza doğrulama + normalize + işlem köprüsü. */
@Controller('webhooks/banking')
export class BankingWebhookController {
  @Post()
  async receive(@Body() payload: BankingWebhookPayload): Promise<NormalizedBankingEvent> {
    if (!verifyWebhookSignature(payload)) {
      throw new UnauthorizedException('Geçersiz webhook imzası');
    }
    const event = normalizeBankingWebhook(payload);
    // Normalize edilen olay burada açık bankacılık / muhasebe akışına köprülenir.
    return event;
  }
}
