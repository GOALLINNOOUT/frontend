// Utility for perfume promo logic
export function getPerfumePromo(perfume) {
  const now = new Date();
  let promoActive = false;
  let promoLabel = '';
  let displayPrice = perfume.price;
  if (
    perfume.promoEnabled &&
    perfume.promoValue !== undefined &&
    perfume.promoValue !== null &&
    perfume.promoStart &&
    perfume.promoEnd &&
    new Date(perfume.promoStart) <= now &&
    new Date(perfume.promoEnd) >= now
  ) {
    promoActive = true;
    if (perfume.promoType === 'discount') {
      displayPrice = Math.round(perfume.price * (1 - perfume.promoValue / 100));
      promoLabel = `-${perfume.promoValue}% off`;
    } else if (perfume.promoType === 'price') {
      displayPrice = perfume.promoValue;
      promoLabel = 'Promo Price';
    }
  }
  return { promoActive, promoLabel, displayPrice };
}
