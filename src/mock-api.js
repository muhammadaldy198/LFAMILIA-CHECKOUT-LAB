// Preview-only simulator. Prevents any real checkout or payment API requests.
export function installMockApi(getDemo) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
    const path = url.pathname;
    if (!path.startsWith('/checkout/') && !path.startsWith('/payments/')) {
      return nativeFetch(input, options);
    }
    let body = {};
    try { body = JSON.parse(options.body || '{}'); } catch { body = {}; }
    const demo = getDemo();
    const selected = demo.packages.find((item) => Number(item.id) === Number(body.package_id));
    const channel = demo.paymentChannels.find((item) => item.code === body.payment_channel_code);
    const subtotal = selected?.price_idr || 0;
    const voucher = String(body.voucher_code || '').toUpperCase() === 'DEMO2000' ? Math.min(2000, subtotal) : 0;
    const fee = channel?.group === 'qris' ? Math.round(subtotal * 0.007) :
      channel?.group === 'va' ? 4000 : channel?.group === 'ewallet' ? 1000 : 0;
    const quote = {
      subtotal_idr: subtotal, member_discount_idr: 0, voucher_discount_idr: voucher,
      discount_idr: voucher, member_tier_code: null, member_discount_bps: 0,
      fee_idr: fee, total_idr: Math.max(0, subtotal - voucher + fee),
      voucher_code: voucher ? 'DEMO2000' : null, payment_channel_code: channel?.code || null,
    };
    let result;
    if (path === '/checkout/nickname') {
      result = { verified: true, nickname: 'DEMO PLAYER', country: 'Indonesia' };
    } else if (path === '/checkout/quote') {
      result = quote;
    } else if (path === '/checkout/vouchers') {
      result = { vouchers: [{ code: 'DEMO2000', discount_idr: 2000, discount_type: 'FIXED', discount_value: 2000, minimum_total_idr: 0, ends_at: null }] };
    } else if (path === '/checkout/orders') {
      result = { ...quote, order_number: 'DUMMY-ONLY-0001', access_code: 'DEMO' };
    } else if (path.startsWith('/payments/orders/')) {
      result = { status: 'simulation_only' };
    } else {
      result = { message: 'Tidak tersedia di checkout dummy.' };
    }
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
}
