// ============================================================================
// 💰 CLUB-FINANCE · Domain Value Object: Money (kuruş hassasiyetli para)
// Kayan nokta hatasından kaçınır: tüm aritmetik kuruş (int) üzerinde yapılır.
// ============================================================================

export type Currency = 'TRY';

export class Money {
  readonly amountKurus: number;
  readonly currency: Currency;

  constructor(amountKurus: number, currency: Currency = 'TRY') {
    if (!Number.isInteger(amountKurus)) throw new Error('Money kuruş değeri tam sayı olmalı');
    this.amountKurus = amountKurus;
    this.currency = currency;
  }

  static fromTl(amount: number, currency: Currency = 'TRY'): Money {
    if (!Number.isFinite(amount)) throw new Error('Geçersiz tutar');
    return new Money(Math.round(amount * 100), currency);
  }

  static zero(currency: Currency = 'TRY'): Money {
    return new Money(0, currency);
  }

  get tl(): number {
    return this.amountKurus / 100;
  }

  isZero(): boolean { return this.amountKurus === 0; }
  isNegative(): boolean { return this.amountKurus < 0; }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountKurus + other.amountKurus, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountKurus - other.amountKurus, this.currency);
  }

  multiply(rate: number): Money {
    return new Money(Math.round(this.amountKurus * rate), this.currency);
  }

  /** Tutar yeterliliği kontrolü (borç ödeme). */
  canCover(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountKurus >= other.amountKurus;
  }

  toJSON(): string {
    return `${this.currency} ${(this.amountKurus / 100).toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Para birimi uyuşmazlığı: ${this.currency} vs ${other.currency}`);
    }
  }
}
