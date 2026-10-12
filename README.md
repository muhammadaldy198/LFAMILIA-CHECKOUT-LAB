# LFAMILIA CHECKOUT LAB

Sandbox **tampilan checkout customer saja**, tanpa koneksi transaksi atau backend production.

Preview Vercel: https://lfamilia-checkout-lab.vercel.app

## Source aktif
- `src/PremiumCheckout.vue`: layout dan interaksi checkout simulasi
- `src/LfamiliaPaymentMethods.vue`: pilihan pembayaran menggunakan pola dari LFAMILIA STORE
- `src/LabVoucherModal.vue`: popup voucher dummy
- `src/lab-pricing.js`: perhitungan harga, biaya, dan diskon simulasi
- `src/demo-data.js`: produk dan metode pembayaran dummy
- `src/main.js`, `src/inertia-mock.js`, `src/mock-api.js`: entry point, adapter CustomerShell, dan pengaman endpoint pembayaran
- `src/premium.css`, `src/refinement.css`, `src/preview.css`: gaya khusus Checkout Lab
- `rebuild/resources/js/Components/CustomerShell.vue` dan composable: header/footer asli
- `rebuild/resources/css/app.css`: CSS customer asli untuk shell dan komponen pembayaran (bukan CSS admin)

## Referensi checkout production
https://github.com/muhammadaldy198/LFAMILIA-STORE/blob/main/rebuild/resources/js/Pages/Catalog/Show.vue

Copy `Show.vue` dari repo utama **tidak di-import** di lab, maka copy itu dibersihkan. CSS admin dan `qa-fixes.css` yang tidak dimuat juga dibuang. Riwayat lama tetap ada di Git.

## Development
1. `npm install`
2. `npm run dev`
3. `npm run build` untuk build Vite; hasil di `dist/`

Stack: Vue 3, Vite 7, Tailwind CSS 4. GitHub `main` di lab terhubung ke Vercel.

## Batasan
Semua nominal, diskon voucher, fee, dan order adalah **simulasi frontend**. Tidak ada transaksi sungguhan. `mock-api.js` sengaja dipertahankan untuk mencegat endpoint checkout/pembayaran; jangan menghapus pengaman ini.

Bila tampilan disetujui, port **hanya perubahan UI yang relevan** ke branch baru berdasarkan LFAMILIA-STORE/main terbaru. Jangan port data dummy, mock, atau pengaturan Vercel. Validasi dan CI production harus dilakukan terpisah.
