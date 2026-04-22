export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatPriceRaw = (price: number): string => {
  return price.toFixed(2);
};

export const formatINR = (amount: number): string => {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};