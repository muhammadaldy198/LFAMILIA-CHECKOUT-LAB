// Dummy data only. Not production prices or customer data.
function picture(label, background) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">' +
    '<rect width="256" height="256" rx="36" fill="' + background + '"/>' +
    '<circle cx="128" cy="113" r="72" fill="#ffffff22"/>' +
    '<text x="128" y="134" font-family="Arial" font-size="72" font-weight="900" text-anchor="middle" fill="#fff">' + label + '</text>' +
    '<text x="128" y="220" font-size="21" font-weight="900" text-anchor="middle" fill="#d3ff72">LFAMILIA</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const channels = [
  { code: 'qris', name: 'QRIS', group: 'qris', available: true },
  { code: 'dana', name: 'DANA', group: 'ewallet', available: true },
  { code: 'gopay', name: 'GoPay', group: 'ewallet', available: true },
  { code: 'bca_va', name: 'BCA Virtual Account', group: 'va', available: true },
  { code: 'bni_va', name: 'BNI Virtual Account', group: 'va', available: true },
  { code: 'wallet', name: 'LFAMILIA Cash', group: 'wallet', available: false },
];
function packages(rows) {
  return rows.map((entry, index) => ({
    id: entry[0], name: entry[1], price_idr: entry[2], group_name: entry[3] || '',
    is_available: true, image_url: null, sort_order: index + 1,
  }));
}
function sample(product, items, fields) {
  return {
    product, packages: items, fields, paymentChannels: channels,
    customer: null, savedAccounts: [], notices: [], reviews: [], faqs: [],
    reviewStats: { total: 0, average: 0 }, initialPackageId: String(items[0].id),
  };
}
export const demos = {
  ml: sample({
    id: 1, slug: 'mobile-legends-preview', name: 'Mobile Legends',
    publisher: 'Moonton', category_name: 'Top Up Game', category_slug: 'top-up-game',
    image_url: picture('ML', '#365dec'),
    description: 'Simulasi checkout untuk desain. Tidak ada transaksi nyata.',
    nickname_check_enabled: true, package_tabs_enabled: false,
  }, packages([
    [101, '5 Diamonds', 1500, 'Diamonds'],
    [102, '12 Diamonds', 3500, 'Diamonds'],
    [103, '28 Diamonds', 7800, 'Diamonds'],
    [104, '56 Diamonds', 14800, 'Diamonds'],
    [105, '86 Diamonds', 22900, 'Diamonds'],
    [106, '172 Diamonds', 44500, 'Diamonds'],
    [107, '257 Diamonds', 65300, 'Diamonds'],
    [108, 'Weekly Diamond Pass', 28300, 'Pass'],
  ]), [
    { field_key: 'user_id', label: 'User ID', type: 'text', placeholder: 'Contoh: 12345678', is_required: true },
    { field_key: 'zone_id', label: 'Zone ID', type: 'text', placeholder: 'Contoh: 1234', is_required: true },
  ]),
  ff: sample({
    id: 2, slug: 'free-fire-preview', name: 'Free Fire',
    publisher: 'Garena', category_name: 'Top Up Game', category_slug: 'top-up-game',
    image_url: picture('FF', '#ef751d'),
    description: 'Simulasi checkout Free Fire tanpa backend.',
    nickname_check_enabled: false, package_tabs_enabled: false,
  }, packages([
    [201, '5 Diamonds', 1200, 'Diamonds'], [202, '12 Diamonds', 2800, 'Diamonds'],
    [203, '50 Diamonds', 8900, 'Diamonds'], [204, '100 Diamonds', 16500, 'Diamonds'],
    [205, '210 Diamonds', 32900, 'Diamonds'], [206, '355 Diamonds', 55000, 'Diamonds'],
    [207, 'Membership Mingguan', 27000, 'Membership'], [208, 'Membership Bulanan', 83000, 'Membership'],
  ]), [
    { field_key: 'user_id', label: 'Player ID', type: 'text', placeholder: 'Masukkan Player ID', is_required: true },
  ]),
};
