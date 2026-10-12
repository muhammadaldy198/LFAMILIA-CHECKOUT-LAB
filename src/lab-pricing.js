// Checkout LAB ONLY: one pricing rule shared by payment cards and confirmation.
// These are illustrative fees, NOT live LFAMILIA / Midtrans charges.
export function quoteForChannel(subtotalIdr, voucherCode, channel) {
  const subtotal = Math.max(0, Math.round(Number(subtotalIdr) || 0));
  const voucher = String(voucherCode || '').trim().toUpperCase();
  const discount = voucher === 'DEMO2000'
    ? Math.min(subtotal, 2000)
    : voucher === 'LF10'
      ? Math.min(subtotal, Math.floor(subtotal * 0.10), 10000)
      : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const group = channel?.group || '';
  // Never show an invented fee before a nominal is chosen.
  const fee = !subtotal ? 0 :
    group === 'qris' ? Math.ceil(afterDiscount * 0.007) :
    group === 'va' ? 4000 :
    group === 'ewallet' ? 1000 : 0;
  const total = Math.max(0, afterDiscount + fee);
  return { subtotal, discount, afterDiscount, fee, total };
}

export function idr(value) {
  return 'Rp ' + Math.max(0, Math.round(Number(value) || 0)).toLocaleString('id-ID');
}
