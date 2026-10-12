<!-- Payment source ported from LFAMILIA-STORE/main: rebuild/resources/js/Pages/Catalog/Show.vue
     Uses the ORIGINAL lf-payment-* classes from rebuild/resources/css/app.css.
     Only wallet label and guest copy adapt to the lab demo. No backend calls. -->
<script setup>
import { computed } from 'vue';
import { quoteForChannel, idr } from './lab-pricing.js';

const props = defineProps({
  paymentChannels: { type: Array, default: () => [] },
  selectedCode: { type: String, default: '' },
  subtotalIdr: { type: Number, default: 0 },
  voucherCode: { type: String, default: '' },
  customer: { type: Object, default: null },
});
const emit = defineEmits(['select']);
const paymentChannels = computed(() => props.paymentChannels || []);
const paymentChannelCode = computed(() => props.selectedCode);
const customer = computed(() => props.customer);
const formatIdr = idr;
const quote = channel => quoteForChannel(props.subtotalIdr, props.voucherCode, channel);
const amount = channel => props.subtotalIdr > 0 ? idr(quote(channel).total) : 'Pilih nominal';
const groupChannel = group => group.items.find(channel => channel.code === paymentChannelCode.value)
  || group.items.find(channel => channel.available !== false) || group.items[0];
const selectedChannel = computed(() => props.paymentChannels.find(channel => channel.code === props.selectedCode));
const selectedQuote = computed(() => quote(selectedChannel.value));
const customerText = (_key, fallback) => fallback;

// Grouping, ordering, and selection semantics from LFAMILIA-STORE main.
const paymentGroups = computed(() => {
    const labels = {
        wallet: ['LFAMILIA Coin', 'Bayar memakai LFAMILIA Coin'],
        qris: ['QRIS', 'Scan dari semua aplikasi yang mendukung QRIS'],
        ewallet: ['E-Wallet', 'Bayar melalui aplikasi e-wallet yang tersedia'],
        va: ['Virtual Account', 'Transfer bank dengan nomor VA unik'],
        retail: ['Retail', 'Bayar melalui gerai retail yang tersedia'],
        other: ['Metode Lainnya', 'Metode pembayaran tersedia'],
    };
    const map = new Map();
    for (const channel of props.paymentChannels || []) {
        const key = channel.group || 'other';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(channel);
    }
    const order = ['wallet', 'qris', 'ewallet', 'va', 'retail', 'other'];
    return [...map.entries()]
        .map(([key, items]) => ({
            key,
            title: labels[key]?.[0] || labels.other[0],
            description: labels[key]?.[1] || labels.other[1],
            items,
        }))
        .sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key));
});
const hasExternalPaymentOption = computed(() => paymentGroups.value.some(group =>
  group.key !== 'wallet' && group.items.some(item => item.available !== false)));
const hasWalletPaymentOption = computed(() => paymentGroups.value.some(group => group.key === 'wallet'));
const hasAvailableWalletPaymentOption = computed(() => paymentGroups.value.some(group =>
  group.key === 'wallet' && group.items.some(item => item.available !== false)));

function choosePayment(code) {
    const channel = (props.paymentChannels || []).find(item => item.code === code && item.available !== false);
    if (!channel) return;
    emit('select', channel.code);
}
</script>

<template>
<div class="lf-panel-body lf-payment-groups">
                        <div v-if="!paymentChannels?.length" class="lf-payment-unavailable">
                            {{ customerText("pages.catalog.show.51de2747", "Belum ada metode pembayaran aktif.") }}
                        </div>
                        <div v-else-if="!hasExternalPaymentOption" class="lf-payment-unavailable">
                            <template v-if="customer && hasAvailableWalletPaymentOption">{{ customerText("pages.catalog.show.4bfa0eb", "Pembayaran otomatis belum tersedia. Kamu masih bisa memakai LFAMILIA Coin bila saldo mencukupi.") }}</template>
                            <template v-else>{{ customerText("pages.catalog.show.f4a728b6", "Belum ada metode pembayaran yang dapat digunakan saat ini.") }}</template>
                        </div>
                        <div
                            v-for="group in paymentGroups"
                            :key="group.key"
                            class="lf-payment-group-card"
                            :class="{selected:group.items.some(x=>x.code===paymentChannelCode)}"
                        >
                            <button
                                type="button"
                                class="lf-payment-group-main"
                                :disabled="group.items.every(x=>x.available===false)"
                                @click="choosePayment(group.items.find(x=>x.code===paymentChannelCode)?.code || group.items.find(x=>x.available!==false)?.code)"
                            >
                                <span v-if="group.key==='wallet'" class="lf-payment-wallet-art">
                                    <img :src="'/assets/payment/lfamilia-cash.webp'" :alt="'LFAMILIA Coin'">
                                </span>
                                <span class="lf-payment-group-copy">
                                    <strong>{{group.title}}</strong>
                                    <small v-if="group.key==='wallet' && customer">Saldo {{formatIdr(customer.balance_idr)}}</small>
                                    <small v-else-if="group.key==='wallet'">Mode demo • LFAMILIA Coin</small>
                                    <small v-else>{{group.description}}</small>
                                </span>
                                <span v-if="subtotalIdr>0" class="lab-payment-amount">{{amount(groupChannel(group))}}</span>
                                <span v-if="group.items.some(x=>x.code===paymentChannelCode)" class="lf-payment-check"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg></span>
                            </button>

                            <div v-if="group.key!=='wallet'" class="lf-payment-brand-strip">
                                <span v-if="group.key==='qris'">{{ customerText("pages.catalog.show.c64a26ec", "QRIS • DANA • ShopeePay") }}</span>
                                <template v-else>
                                    <span v-for="channel in group.items.slice(0,7)" :key="channel.code">{{channel.name}}</span>
                                </template>
                            </div>

                            <div
                                v-if="group.key!=='wallet' && group.key!=='qris' && group.items.some(x=>x.code===paymentChannelCode)"
                                class="lf-payment-channel-grid"
                            >
                                <button
                                    v-for="channel in group.items"
                                    :key="channel.code"
                                    type="button"
                                    :disabled="channel.available===false"
                                    :class="{selected:paymentChannelCode===channel.code}"
                                    @click="choosePayment(channel.code)"
                                >
                                    <span class="lf-payment-channel-copy lab-payment-option-copy">
                                        <strong>{{channel.name}}</strong>
                                        <span class="lab-payment-option-total">{{amount(channel)}}</span>
                                        <small class="lab-payment-automatic">Proses Otomatis</small>
                                    </span>
                                </button>
                            </div>
                            <div v-if="subtotalIdr>0 && group.items.some(x=>x.code===paymentChannelCode)" class="lab-payment-breakdown" aria-live="polite">
                              <div class="lab-payment-breakdown-row"><span>Harga produk</span><strong>{{idr(selectedQuote.subtotal)}}</strong></div>
                              <div v-if="selectedQuote.discount" class="lab-payment-breakdown-row lab-payment-discount"><span>Diskon {{voucherCode}}</span><strong>− {{idr(selectedQuote.discount)}}</strong></div>
                              <div class="lab-payment-breakdown-row"><span>Biaya pembayaran <small>(simulasi)</small></span><strong>{{idr(selectedQuote.fee)}}</strong></div>
                              <div class="lab-payment-breakdown-final"><span>Total bayar</span><strong>{{idr(selectedQuote.total)}}</strong></div>
                            </div>
                        </div>
                    </div>
</template>

<!-- LFAMILIA Coin sizing lives next to the ported payment component.
     The original storefront CSS sets wallet art to 32px !important.
     Scope this override to the lab component; do not edit global CSS. -->
<style scoped>
.lf-payment-wallet-art {
  width: 48px !important;
  height: 48px !important;
  flex: 0 0 48px !important;
  border-radius: 11px !important;
}

/* Local pricing presentation for the original LFAMILIA-STORE payment component.
   The lab uses one quote function for per-method prices and checkout summary. */
.lab-payment-amount {
  display: block;
  flex: 0 0 auto;
  white-space: nowrap;
  color: #e1edff;
  font-size: 12px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}
.lab-payment-option-copy {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  min-width: 0;
  width: 100%;
  text-align: left !important;
  white-space: normal !important;
}
.lab-payment-option-copy strong { font-size: 11px; line-height: 1.35; overflow-wrap: anywhere; }
.lab-payment-option-total {
  color: #edf4ff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.3;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.lab-payment-automatic {
  display: block;
  width: 100%;
  color: #b5c5d7;
  border-top: 1px dashed #e3ebff24;
  padding-top: 6px;
  font-size: 10px;
  font-style: italic;
  font-weight: 500;
  line-height: 1.25;
}
.lf-payment-channel-grid > button { text-align: left; height: auto; min-height: 116px; align-items: stretch; }
.lab-payment-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #a5bdd72e;
  background: #121f30;
  padding: 13px 15px;
  color: #cfdbef;
  font-size: 11px;
}
.lab-payment-breakdown-row,
.lab-payment-breakdown-final {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.lab-payment-breakdown-row span { min-width: 0; overflow-wrap: anywhere; }
.lab-payment-breakdown-row small { color: #859db9; font-size: 9px; }
.lab-payment-breakdown-row strong { flex: 0 0 auto; white-space: nowrap; color: #e8f0ff; font-variant-numeric: tabular-nums; }
.lab-payment-discount strong { color: #bee991; }
.lab-payment-breakdown-final {
  border-top: 1px solid #a5bdd72d;
  margin-top: 3px;
  padding-top: 10px;
  font-size: 13px;
  font-weight: 850;
  color: #f2f7ff;
}
.lab-payment-breakdown-final strong { color: #b8d8ff; white-space: nowrap; font-size: 15px; font-variant-numeric: tabular-nums; }
@media (max-width: 370px) {
 .lab-payment-amount { font-size: 10px; }
 .lab-payment-breakdown { padding: 10px; }
 .lab-payment-breakdown-final strong { font-size: 13px; }
}

</style>
