export interface Fee {
  id: string;
  name: string;
  amount: number;
  enabled: boolean;
  condition: 'always' | 'min_items' | 'min_amount';
  conditionValue?: number;
}

const FEES_KEY = 'buildmore_fees';

export const DEFAULT_FEES: Fee[] = [
  { id: 'logistics', name: 'Logistics Fee', amount: 450, enabled: true, condition: 'always' },
];

export function getFees(): Fee[] {
  try {
    const stored = localStorage.getItem(FEES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FEES;
  } catch {
    return DEFAULT_FEES;
  }
}

export function saveFees(fees: Fee[]): void {
  localStorage.setItem(FEES_KEY, JSON.stringify(fees));
}

export function getApplicableFees(fees: Fee[], itemCount: number, subtotal: number): Fee[] {
  return fees.filter(fee => {
    if (!fee.enabled) return false;
    switch (fee.condition) {
      case 'always': return true;
      case 'min_items': return itemCount >= (fee.conditionValue ?? 1);
      case 'min_amount': return subtotal >= (fee.conditionValue ?? 0);
      default: return false;
    }
  });
}
