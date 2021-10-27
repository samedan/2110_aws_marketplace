export const convertDollarsToCents = (price) =>
  (price * 100)
    // integer
    .toFixed(0);

export const convertCentsToDollars = (price) => (price / 100).toFixed(2);
