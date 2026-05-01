import type { Fee } from '../api';

export type { Fee };

export function getApplicableFees(fees: Fee[], itemCount: number, subtotal: number): Fee[] {
  return fees.filter(fee => {
    if (!fee.enabled) return false;
    switch (fee.condition) {
      case 'always':     return true;
      case 'min_items':  return itemCount >= (fee.conditionValue ?? 1);
      case 'min_amount': return subtotal  >= (fee.conditionValue ?? 0);
      default:           return false;
    }
  });
}
