import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'HTG'): string {
  return new Intl.NumberFormat('fr-HT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale = 'fr-HT'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '…' : str;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  moncash:     'MonCash',
  natcash:     'NatCash',
  credit_card: 'Carte de Crédit',
  zelle:       'Zelle',
  cashapp:     'CashApp',
  paypal:      'PayPal',
  venmo:       'Venmo',
  wise:        'Wise',
  remitly:     'Remitly',
  interac:     'Interac e-Transfer',
};

export const STATUS_COLORS = {
  pending:    'bg-warning/20 text-warning border-warning/30',
  approved:   'bg-success/20 text-success border-success/30',
  completed:  'bg-success/20 text-success border-success/30',
  rejected:   'bg-danger/20 text-danger border-danger/30',
  failed:     'bg-danger/20 text-danger border-danger/30',
  processing: 'bg-brand-blue/20 text-blue-300 border-brand-blue/30',
  cancelled:  'bg-bg-muted text-gray-400 border-bg-border',
};
