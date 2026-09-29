// src/lib/card-utils.ts

export type CardBrand = 'Visa' | 'MasterCard' | 'Amex' | 'RuPay' | 'Discover' | 'Unknown';

export function getCardBrand(number: string): CardBrand {
  const clean = number.replace(/\D/g, '');

  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MasterCard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^(60|65|81|82|508)/.test(clean)) return 'RuPay';
  if (/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5])|64[4-9]|65)/.test(clean)) return 'Discover';

  return 'Unknown';
}

export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 2) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
}