import { prisma } from './prisma';
import {
    CURRENCY_SYMBOLS,
    DEFAULT_CURRENCY_CODE,
    DEFAULT_CURRENCY_SYMBOL,
    formatCurrencyCents,
} from './currency-format';

export async function getCurrencySymbol(): Promise<string> {
    try {
        const settings = await prisma.programSettings.findFirst();
        const currency = settings?.currency || DEFAULT_CURRENCY_CODE;
        return CURRENCY_SYMBOLS[currency] || currency;
    } catch (error) {
        console.error('Failed to fetch currency symbol:', error);
        return DEFAULT_CURRENCY_SYMBOL;
    }
}

export function formatCurrency(cents: number, symbol: string): string {
    return formatCurrencyCents(cents, symbol);
}

export async function formatAmount(cents: number): Promise<string> {
    const symbol = await getCurrencySymbol();
    return formatCurrency(cents, symbol);
}
