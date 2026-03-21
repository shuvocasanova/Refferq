export const DEFAULT_CURRENCY_CODE = 'USD';
export const DEFAULT_CURRENCY_SYMBOL = '$';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  BGN: 'лв.',
  CAD: 'CA$',
  AUD: 'A$',
};

export function getCurrencySymbolForCode(currency?: string | null): string {
  if (!currency) {
    return DEFAULT_CURRENCY_SYMBOL;
  }

  return CURRENCY_SYMBOLS[currency] || currency;
}

function normalizeCurrencyNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatCurrencyValue(
  amount: number | string | null | undefined,
  symbol?: string | null,
  locale?: string,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  const normalizedAmount = normalizeCurrencyNumber(amount);
  const normalizedSymbol = symbol || DEFAULT_CURRENCY_SYMBOL;

  return `${normalizedSymbol}${normalizedAmount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

export function formatCurrencyCents(
  cents: number | string | null | undefined,
  symbol?: string | null,
  locale?: string,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  return formatCurrencyValue(
    normalizeCurrencyNumber(cents) / 100,
    symbol,
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
  );
}