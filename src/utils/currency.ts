const EXCHANGE_RATE = 83.5;

export const formatPrice = (price: number): string => {
  const priceInINR = price * EXCHANGE_RATE;
  return `₹${priceInINR.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatPriceRaw = (price: number): string => {
  const priceInINR = price * EXCHANGE_RATE;
  return priceInINR.toFixed(2);
};

export const formatINR = (amount: number): string => {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};