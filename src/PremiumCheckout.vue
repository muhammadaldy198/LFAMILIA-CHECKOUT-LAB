<script setup>
import { computed, reactive, ref, watch } from 'vue'
const props=defineProps({product:{type:Object,required:true},packages:{type:Array,default:()=>[]},fields:{type:Array,default:()=>[]},paymentChannels:{type:Array,default:()=>[]}})
const chosen=ref(null),method=ref(''),whatsapp=ref(''),email=ref(''),voucherInput=ref(''),voucher=ref(''),error=ref(''),voucherModal=ref(false),confirmModal=ref(false),successModal=ref(false),tab=ref('transaksi')
const account=reactive({})
const expanded=ref([])
const payments=[{id:'wallet',title:'LFAMILIA Coin',subtitle:'Pembayaran dengan koin LFAMILIA',symbol:'LF'},{id:'qris',title:'QRIS',subtitle:'Scan dengan aplikasi pembayaran',symbol:'▦'},{id:'ewallet',title:'E-Wallet',subtitle:'Dompet digital',symbol:'◉'},{id:'va',title:'Virtual Account',subtitle:'Transfer bank otomatis',symbol:'▥'},{id:'retail',title:'Gerai Retail',subtitle:'Pembayaran di gerai',symbol:'▣'},{id:'other',title:'Metode Lain',subtitle:'Metode pembayaran lainnya',symbol:'✦'}]
const vouchers=[{code:'DEMO2000',name:'Potongan Rp 2.000',detail:'Hemat langsung untuk semua nominal'},{code:'LF10',name:'Diskon 10%',detail:'Maksimal Rp 10.000'}]
const money=n=>'Rp '+Math.max(0,Math.round(Number(n)||0)).toLocaleString('id-ID')
// Same data-driven grouping and optional tabs as LFAMILIA STORE main/Show.vue.
const packageGroups=computed(()=>{
  const groups=new Map()
  for(const item of props.packages||[]){const key=item.group_name||'';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}
  const rows=[...groups].map(([name,items])=>({name,items}))
  const configured=props.product?.package_tabs_enabled?(props.product.package_tabs||[]):[]
  if(!configured.length)return rows
  return [...rows].sort((a,b)=>{
    const ai=configured.indexOf(a.name),bi=configured.indexOf(b.name)
    return (ai<0?Number.MAX_SAFE_INTEGER:ai)-(bi<0?Number.MAX_SAFE_INTEGER:bi)
  })
})
const packageTabs=computed(()=>props.product?.package_tabs_enabled
  ?(props.product.package_tabs||[]).filter(name=>packageGroups.value.some(g=>g.name===name)):[])
const activePackageTab=ref('')
const visiblePackageGroups=computed(()=>packageTabs.value.length
  ?packageGroups.value.filter(g=>g.name===(activePackageTab.value||packageTabs.value[0]))
  :packageGroups.value)
const selected=computed(()=>props.packages.find(x=>String(x.id)===String(chosen.value)))
const payment=computed(()=>props.paymentChannels.find(x=>x.code===method.value))
const price=computed(()=>Number(selected.value?.price_idr)||0)
const subtotal=computed(()=>price.value)
const discount=computed(()=>voucher.value==='DEMO2000'?Math.min(2000,subtotal.value):voucher.value==='LF10'?Math.min(Math.floor(subtotal.value*.1),10000):0)
const fee=computed(()=>payment.value?.group==='qris'?Math.ceil((subtotal.value-discount.value)*.007):payment.value?.group==='va'?4000:payment.value?.group==='ewallet'?1000:0)
const total=computed(()=>Math.max(0,subtotal.value-discount.value+fee.value))
const groupedPayments=computed(()=>{
  const known=new Set(payments.map(p=>p.id))
  return payments.map(p=>({...p,methods:(props.paymentChannels||[]).filter(c=>(c.group||'other')===p.id||p.id==='other'&&!known.has(c.group))})).filter(p=>p.methods.length)
})
watch(()=>props.product.slug,()=>{chosen.value=null;activePackageTab.value='';method.value='';voucher.value='';voucherInput.value='';tab.value='transaksi';whatsapp.value='';Object.keys(account).forEach(x=>delete account[x])})
function notify(message){window.dispatchEvent(new CustomEvent('lab:notice',{detail:message}))}
function applyVoucher(code=voucherInput.value){const v=String(code||'').trim().toUpperCase();if(!vouchers.some(x=>x.code===v)){error.value=v?'Kode voucher tidak tersedia pada demo.':'Masukkan kode voucher terlebih dahulu.';return}voucher.value=v;voucherInput.value=v;error.value='';voucherModal.value=false}
function togglePayment(id){expanded.value=expanded.value.includes(id)?[]:[id]}
function order(){const missing=props.fields.some(x=>x.is_required&&!String(account[x.field_key]||'').trim());if(missing){notify('Lengkapi data akun terlebih dahulu.');document.getElementById('lfx-account')?.scrollIntoView({behavior:'smooth'});return}if(!chosen.value){notify('Pilih nominal terlebih dahulu.');return}if(!method.value){notify('Pilih metode pembayaran terlebih dahulu.');document.getElementById('lfx-payment')?.scrollIntoView({behavior:'smooth'});return}if(!/^[+]?[0-9 ]{9,18}$/.test(whatsapp.value.trim())){notify('Isi nomor WhatsApp yang valid untuk demo.');document.getElementById('lfx-contact')?.scrollIntoView({behavior:'smooth'});return}confirmModal.value=true}
function shortLogo(x){const m={qris:'QR',dana:'D',gopay:'G',bca_va:'BCA',bni_va:'BNI',wallet:'LF'};return m[x.code]||x.name?.slice(0,2).toUpperCase()||'PAY'}
</script>

<template>
<div class="lfx">
  <main>
    <div class="lfx-hero"><img src="/lfamilia-hero.svg" alt="Banner top up LFAMILIA Store"/><span class="lfx-hero-overlay"></span><span class="lfx-hero-micro">LFAMILIA <b>✦</b> GAME TOP UP</span></div>
    <section class="lfx-product-header"><div class="lfx-container lfx-product-header-inner">
      <div class="lfx-product-cover"><div class="lfx-cover-frame"><img v-if="product.image_url" :src="product.image_url" :alt="product.name"/><span v-else>LF</span></div></div>
      <div class="lfx-product-intro"><div class="lfx-breadcrumb"><span>Beranda</span><span>›</span><span>Top Up Game</span><span>›</span><strong>{{product.name}}</strong></div><div class="lfx-overline">DIGITAL TOP UP · PREMIUM EXPERIENCE</div><h1>{{product.name}}</h1><p>{{product.publisher||'LFAMILIA STORE'}}</p></div><div class="lfx-trust"><span><b>⚡</b> Proses Cepat</span><span><b>✧</b> Layanan Chat 24/7</span><span><b>◷</b> Pembayaran Aman</span></div>

    </div></section>
    <div class="lfx-container lfx-content">
      <div class="lfx-mobile-tabs"><button :class="{active:tab==='transaksi'}" @click="tab='transaksi'">Transaksi</button><button :class="{active:tab==='detail'}" @click="tab='detail'">Keterangan</button></div>
      <div class="lfx-layout">
        <div class="lfx-sections">
          <template v-if="tab==='transaksi'">
            <section id="lfx-account" class="lfx-panel"><header class="lfx-panel-header"><span class="lfx-number">1</span><div><h2>Data Akun</h2></div></header><div class="lfx-panel-content"><div class="lfx-field-grid" :class="{single:fields.length===1}"><label v-for="field in fields" :key="field.field_key" class="lfx-field"><span>{{field.label}} <b v-if="field.is_required">*</b><i title="Pastikan data akun benar">ⓘ</i></span><input v-model="account[field.field_key]" :placeholder="field.placeholder||'Masukkan '+field.label" :type="field.type==='number'?'number':'text'" autocomplete="off"/></label></div><div class="lfx-hint"><span>i</span> Pastikan ID atau Server sudah sesuai sebelum memesan.</div></div></section>
            <section id="lfx-nominal" class="lfx-panel">
              <header class="lfx-panel-header"><span class="lfx-number">2</span><div><h2>Pilih Nominal</h2></div></header>
              <div class="lfx-panel-content">
                <div v-if="packageTabs.length" class="lfx-category-tabs" role="tablist" aria-label="Kategori dari LFAMILIA"><button v-for="item in packageTabs" :key="item" role="tab" :aria-selected="(activePackageTab||packageTabs[0])===item" :class="{active:(activePackageTab||packageTabs[0])===item}" @click="activePackageTab=item">{{item}}</button></div>
                <section v-for="itemsGroup in visiblePackageGroups" :key="itemsGroup.name||'default'" class="lfx-nominal-group">
                  <div v-if="itemsGroup.name" class="lfx-subtitle"><span class="lfx-mini-star">✦</span><h3>{{itemsGroup.name}}</h3><small>{{itemsGroup.items.length}} pilihan</small></div>
                  <div class="lfx-nominal-grid">
                    <button v-for="item in itemsGroup.items" :key="item.id" class="lfx-nominal" :class="{selected:String(chosen)===String(item.id)}" :disabled="item.is_available===false" :aria-pressed="String(chosen)===String(item.id)" @click="chosen=item.id">
                      <span class="lfx-check">{{String(chosen)===String(item.id)?'✓':''}}</span>
                      <span class="lfx-nominal-top"><span class="lfx-nominal-name"><strong>{{item.name}}</strong></span><img v-if="item.image_url" class="lfx-item-art" :src="item.image_url" alt="" loading="lazy"/><span v-else class="lfx-diamond" aria-hidden="true">✦</span></span>
                      <span class="lfx-nominal-bottom"><b>{{money(item.price_idr)}}</b><small v-if="String(chosen)===String(item.id)">DIPILIH</small></span>
                    </button>
                  </div>
                </section>
                <div v-if="!visiblePackageGroups.length" class="lfx-empty">Nominal belum tersedia.</div>
              </div>
            </section>
            <section id="lfx-payment" class="lfx-panel"><header class="lfx-panel-header"><span class="lfx-number">3</span><div><h2>Pilih Pembayaran</h2></div></header>
              <div class="lfx-panel-content">
                <div class="lfx-pay-list">
                  <section v-for="category in groupedPayments" :key="category.id" class="lfx-pay-group" :class="{selected:category.methods.some(x=>x.code===method),coin:category.id==='wallet'}">
                    <template v-if="category.id==='wallet'">
                      <button class="lfx-coin-row" :aria-pressed="method===category.methods[0].code" :disabled="category.methods.every(entry=>entry.available===false)" @click="method=category.methods[0].code">
                        <span class="lfx-coin-emblem">LF</span>
                        <span class="lfx-coin-description"><strong>LFAMILIA Coin</strong><small>Gunakan saldo koin LFAMILIA</small></span>
                        <span class="lfx-coin-status">{{method===category.methods[0].code?'Dipilih':'Pilih'}}</span>
                        <span class="lfx-pay-radio">{{method===category.methods[0].code?'✓':''}}</span>
                      </button>
                    </template>
                    <template v-else>
                      <button class="lfx-pay-title" :aria-expanded="expanded.includes(category.id)" @click="togglePayment(category.id)">
                        <span class="lfx-pay-symbol">{{category.symbol}}</span>
                        <span class="lfx-pay-description"><strong>{{category.title}}</strong></span>
                        <span class="lfx-pay-count">{{category.methods.length}} metode</span>
                        <span class="lfx-pay-chevron" :class="{open:expanded.includes(category.id)}" aria-hidden="true"></span>
                      </button>
                      <div v-if="expanded.includes(category.id)" class="lfx-pay-grid" :class="{'lfx-pay-grid-va':category.id==='va'}">
                        <button v-for="entry in category.methods" :key="entry.code" type="button" class="lfx-pay-card" :class="{selected:method===entry.code,unavailable:entry.available===false}" :disabled="entry.available===false" :aria-pressed="method===entry.code" @click="method=entry.code">
                          <span class="lfx-method-top"><span class="lfx-pay-brand" :class="'lfx-brand-'+entry.code">{{shortLogo(entry)}}</span><span class="lfx-pay-radio">{{method===entry.code?'✓':''}}</span></span>
                          <span class="lfx-method-body"><strong class="lfx-pay-name">{{entry.name}}</strong><span class="lfx-pay-price">{{selected?money(price+(entry.group==='va'?4000:entry.group==='ewallet'?1000:entry.group==='qris'?Math.ceil(price*.007):0)):'Pilih nominal dahulu'}}</span><small class="lfx-pay-auto">Proses Otomatis</small></span>
                        </button>
                      </div>
                    </template>
                  </section>
                </div>
                <p class="lfx-pay-disclaimer">✧ Metode pembayaran dan biaya merupakan simulasi, tidak memproses transaksi.</p>
              </div>
            </section>
            <section class="lfx-panel" id="lfx-voucher"><header class="lfx-panel-header"><span class="lfx-number">4</span><div><h2>Voucher Diskon</h2></div></header><div class="lfx-panel-content"><div class="lfx-voucher-input"><span>⌗</span><input v-model="voucherInput" placeholder="Masukkan kode voucher" aria-label="Kode voucher diskon" autocapitalize="characters" @keyup.enter="applyVoucher()"/><button @click="applyVoucher()">Gunakan</button></div><p v-if="error" class="lfx-error">{{error}}</p><div v-if="voucher" class="lfx-applied"><span>✓</span><div><strong>{{voucher}} berhasil dipakai</strong><small>Diskon {{money(discount)}}</small></div><button @click="voucher='';voucherInput='';error=''">Hapus</button></div><button class="lfx-voucher-browse" @click="voucherModal=true"><span>♧</span><strong>Lihat voucher yang tersedia</strong><b>→</b></button></div></section>
            <section id="lfx-contact" class="lfx-panel"><header class="lfx-panel-header"><span class="lfx-number">5</span><div><h2>Detail Kontak</h2></div></header><div class="lfx-panel-content"><div class="lfx-field-grid"><label class="lfx-field"><span>Nomor WhatsApp <b>*</b></span><input v-model="whatsapp" type="tel" inputmode="tel" placeholder="081234567890"/></label><label class="lfx-field"><span>Email <em>(opsional)</em></span><input v-model="email" type="email" placeholder="nama@email.com"/></label></div><div class="lfx-hint"><span>i</span> Ini hanya preview, data tidak dikirim ke sistem transaksi.</div></div></section>
          </template>
          <section v-else class="lfx-panel lfx-details"><header class="lfx-panel-header"><span class="lfx-number">i</span><div><h2>Keterangan {{product.name}}</h2></div></header><div class="lfx-panel-content"><p>{{product.description}}</p><h3>Cara top up</h3><ol><li>Masukkan data akun tujuan.</li><li>Pilih nominal yang diinginkan.</li><li>Pilih metode pembayaran.</li><li>Gunakan voucher diskon jika ada.</li><li>Isi kontak lalu tinjau pesanan.</li></ol></div></section>
          <section class="lfx-description-box"><div><span>✧</span><strong>Deskripsi {{product.name}}</strong></div><p>{{product.description}}</p></section>
        </div>

        <aside class="lfx-aside"><div class="lfx-cta-side">
           <div class="lfx-side-heading"><strong>Siap untuk top up?</strong><small>Isi data, pilih nominal dan metode pembayaran.</small></div>
           <div class="lfx-side-selection">{{selected?.name||'Belum ada item produk yang dipilih.'}}</div>
           <button class="lfx-order-button" @click="order"><span>Bayar Sekarang</span><b>→</b></button>
           <div class="lfx-safety">♧ Aman · Preview tanpa transaksi nyata</div>
         </div><div class="lfx-side-note"><span>✧</span><div><strong>LFAMILIA EXPERIENCE</strong><small>Top up praktis dan transparan.</small></div></div></aside>
            </div>
    </div>
  </main>
  <div class="lfx-sticky-mobile"><div class="lfx-sticky-selection">{{selected?.name||'Belum ada item produk yang dipilih.'}}</div><button @click="order">Bayar Sekarang <b>→</b></button></div>

  <div v-if="voucherModal" class="lfx-modal-backdrop" @click.self="voucherModal=false"><div class="lfx-modal" role="dialog" aria-modal="true" aria-labelledby="voucher-modal-title"><div class="lfx-modal-header"><div><small>EXCLUSIVE OFFERS</small><h2 id="voucher-modal-title">Pilih Voucher Diskon</h2></div><button aria-label="Tutup" @click="voucherModal=false">×</button></div><p class="lfx-modal-description">Voucher di bawah khusus simulasi frontend.</p><div class="lfx-voucher-list"><button v-for="v in vouchers" :key="v.code" @click="applyVoucher(v.code)" class="lfx-voucher-option"><span>%</span><div><strong>{{v.name}}</strong><small>{{v.detail}}</small><code>{{v.code}}</code></div><b>Pakai →</b></button></div><p class="lfx-modal-note">Tidak berlaku di LFAMILIA STORE production.</p></div></div>
  <div v-if="confirmModal" class="lfx-modal-backdrop" @click.self="confirmModal=false"><div class="lfx-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div class="lfx-modal-header"><div><small>FINAL CHECK</small><h2 id="confirm-title">Konfirmasi Pesanan</h2></div><button aria-label="Tutup" @click="confirmModal=false">×</button></div><p class="lfx-modal-description">Periksa kembali rincian simulasi pesananmu.</p><div class="lfx-confirm-rows">
  <div><span>Produk</span><b>{{product.name}}</b></div>
  <div v-for="field in fields" :key="field.field_key"><span>{{field.label}}</span><b>{{account[field.field_key]}}</b></div>
  <div><span>Nominal</span><b>{{selected?.name}}</b></div>
  <div><span>Pembayaran</span><b>{{payment?.name}}</b></div>
  <div><span>WhatsApp</span><b>{{whatsapp}}</b></div>
  <div><span>Harga</span><b>{{money(subtotal)}}</b></div>
  <div v-if="discount"><span>Diskon {{voucher}}</span><b class="lfx-saved">− {{money(discount)}}</b></div>
  <div><span>Biaya pembayaran</span><b>{{money(fee)}}</b></div>
  <div class="lfx-confirm-final"><span>Total Pembayaran</span><b>{{money(total)}}</b></div></div><div class="lfx-modal-buttons"><button @click="confirmModal=false">Kembali</button><button @click="confirmModal=false;successModal=true">Lanjut Simulasi →</button></div><p class="lfx-modal-note">Tidak ada order atau pembayaran sungguhan.</p></div></div>
  <div v-if="successModal" class="lfx-modal-backdrop" @click.self="successModal=false"><div class="lfx-modal lfx-success" role="dialog" aria-modal="true" aria-labelledby="success-title"><div class="lfx-success-mark">✓</div><small>SIMULASI BERHASIL</small><h2 id="success-title">Checkout siap dipreview</h2><p>Ini hanyalah simulasi tampilan. Pesanan tidak diproses dan saldo tidak terpotong.</p><button class="lfx-order-button" @click="successModal=false">Kembali ke Checkout</button></div></div>
</div>
</template>
