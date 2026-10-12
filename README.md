# LFAMILIA CHECKOUT LAB

Sandbox **halaman checkout customer saja**. Tidak terhubung ke website production.

## Sumber kode
Checkout dan styling disalin apa adanya dari repo muhammadaldy198/LFAMILIA-STORE branch main pada 12 Oktober 2026.
Halaman checkout asli berada di rebuild/resources/js/Pages/Catalog/Show.vue.
Komponen CustomerShell.vue, customerPresentation.js, app.css dan admin.css juga disalin dari main.
Tidak menggunakan perubahan checkout dari PR lama.

## Stack
Vue 3 + Tailwind CSS 4 + Vite 7, sama dengan stack frontend LFAMILIA STORE. Backend Laravel + Inertia asli tidak dijalankan di preview; modul src/inertia-mock.js hanya dipakai untuk adapter sementara.

## Menjalankan secara lokal
1. Jalankan npm install
2. Jalankan npm run dev
3. Buka alamat Vite yang tampil (biasanya http://localhost:5173)

## Cloudflare Pages
Buat proyek Cloudflare Pages terpisah dari production dan tautkan repo LFAMILIA-CHECKOUT-LAB:
- Branch: main
- Build command: npm run build
- Build output: dist
- Root directory: / (default)

Cloudflare memberi URL subdomain *.pages.dev setelah deployment sukses. Repo ini belum memiliki URL preview otomatis sebelum Pages terhubung.

## Batasan dummy
- Semua produk, harga, ongkos pembayaran, voucher, nickname, dan invoice adalah contoh buatan untuk desain UI.
- Simulator mencegat endpoint checkout/pembayaran agar tidak memanggil backend asli.
- Tidak ada API key, credential, webhook, database, pembayaran, login, atau transaksi sungguhan.
- Tombol navigasi yang menuju halaman lain dinonaktifkan karena scope hanya checkout.

## Cara membawa hasil kembali ke repo utama
1. Desain/revisi pada source checkout & CSS di rebuild/resources.
2. Bila disetujui, buat branch baru dari main terbaru di LFAMILIA-STORE.
3. Port hanya perubahan source yang diperlukan. Jangan port src/, index.html, vite.config.js, package.json, atau data dummy.
4. Jalankan CI lengkap serta pengujian integrasi harga/payment di repo utama sebelum PR/merge.
5. Jangan mengubah backend, seller, SKU, harga riil, Digiflazz, Midtrans, atau VPS melalui repo lab.
