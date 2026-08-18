import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService, Row } from '../../core/database/database.module';
import { PayDto, RedeemCouponDto } from './dto/wallet.dto';

export interface WalletRow extends Row {
  fiat_balance: number;
  token_balance: number;
  blocked_amount: number;
}

/** Likya Pay cüzdan modülü — bakiye, QR ödeme, kupon (mevcut wallets tablosu + yeni transaction log). */
@Injectable()
export class WalletService {
  constructor(private readonly db: DatabaseService) {}

  async balance(userId: string): Promise<WalletRow> {
    try {
      const rows = await this.db.query<WalletRow>(
        'SELECT fiat_balance, token_balance, blocked_amount FROM wallets WHERE user_id = $1',
        [userId],
      );
      if (rows.length > 0) return rows[0];
    } catch { /* degrade */ }
    return { fiat_balance: 0, token_balance: 0, blocked_amount: 0 };
  }

  /** QR ödeme: bakiye yeterliyse düş + transaction log (atomik koruma: RETURNING kontrolü). */
  async pay(userId: string, dto: PayDto) {
    const rows = await this.db.query<WalletRow>(
      `UPDATE wallets SET fiat_balance = fiat_balance - $2, updated_at = NOW()
        WHERE user_id = $1 AND fiat_balance >= $2
        RETURNING fiat_balance, token_balance, blocked_amount`,
      [userId, dto.amount],
    );
    if (rows.length === 0) throw new BadRequestException('Yetersiz bakiye veya cüzdan bulunamadı');

    const txn = await this.db.query<Row>(
      `INSERT INTO likya_pay_transactions (user_id, kind, amount, ref_type, ref_id)
       VALUES ($1, 'debit', $2, $3, $4) RETURNING id, amount, created_at`,
      [userId, dto.amount, dto.ref_type ?? '', dto.ref_id ?? ''],
    );

    return { balance: rows[0].fiat_balance, transaction: txn[0], message: 'Ödeme tamamlandı' };
  }

  /** Kupon kullan: code + süre + tek kullanım kontrolü. */
  async redeemCoupon(userId: string, dto: RedeemCouponDto) {
    const rows = await this.db.query<Row>(
      `UPDATE coupons SET used_at = NOW()
        WHERE code = $1 AND user_id = $2 AND used_at IS NULL AND valid_until > NOW()
        RETURNING id, code, discount`,
      [dto.code.toUpperCase(), userId],
    );
    if (rows.length === 0) throw new NotFoundException('Kupon geçersiz, kullanılmış veya süresi dolmuş');

    // Kupon indirimini cüzdana tanımla
    const updated = await this.db.query<WalletRow>(
      `UPDATE wallets SET fiat_balance = fiat_balance + $2, updated_at = NOW()
        WHERE user_id = $1 RETURNING fiat_balance`,
      [userId, Number(rows[0].discount)],
    );

    return { coupon: rows[0], new_balance: updated.length > 0 ? updated[0].fiat_balance : 0 };
  }
}
