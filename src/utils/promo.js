// promo.js - Utility for handling promotions

/**
 * Returns the display price and promo status for a cart/product item.
 * @param {object} item - The product/cart item
 * @returns {{ price: number, promoActive: boolean, label?: string }}
 */
export function getPromoPrice(item) {
  if (!item) return { price: 0, promoActive: false };
  const now = new Date();
  if (
    item.promoEnabled &&
    item.promoValue &&
    item.promoStart &&
    item.promoEnd &&
    new Date(item.promoStart) <= now &&
    new Date(item.promoEnd) >= now
  ) {
    if (item.promoType === 'discount') {
      return {
        price: Math.round(item.price * (1 - item.promoValue / 100)),
        promoActive: true,
        label: `-${item.promoValue}% off`
      };
    } else if (item.promoType === 'price') {
      return {
        price: item.promoValue,
        promoActive: true,
        label: 'Promo Price'
      };
    }
  }
  return { price: item.price, promoActive: false };
}
