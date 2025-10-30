import { useMemo } from 'react';

export const useTourPricing = (tour) => {
  const getPriceAsNumber = (priceValue) => {
    if (!priceValue) return 0;
    let price = priceValue;
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.-]/g, ''));
    }
    return isNaN(price) ? 0 : Math.max(0, price);
  };

  const pricing = useMemo(() => {
    if (!tour) return null;

    const basePrice = getPriceAsNumber(tour.base_price);
    const finalPrice = getPriceAsNumber(tour.final_price) || basePrice;
    const commissionRate = parseFloat(tour.commission_rate) || 0;

    return {
      basePrice,
      finalPrice,
      commissionRate: commissionRate * 100,
      commissionAmount: finalPrice - basePrice,
      formattedBasePrice: new Intl.NumberFormat('es-ES').format(basePrice),
      formattedFinalPrice: new Intl.NumberFormat('es-ES').format(finalPrice),
    };
  }, [tour]);

  return pricing;
};