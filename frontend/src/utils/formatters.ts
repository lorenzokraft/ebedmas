export const formatNairaAmount = (amount: string | number): string => {
  // Convert to number and divide by 100 if it's in kobo
  const value = typeof amount === 'string' ? 
    Number(amount.replace(/[^0-9.-]+/g, "")) : 
    amount;
  
  const normalizedAmount = value > 1000 ? value / 100 : value;
  
  // Format with commas but no decimal places
  return `₦${Math.round(normalizedAmount).toLocaleString('en-NG')}`;
};
