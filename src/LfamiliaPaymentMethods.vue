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
                                class="lab-payment-method-grid"
                                role="radiogroup"
                                :aria-label="'Pilih metode '+group.title"
                            >
                                <div
                                    v-for="channel in group.items"
                                    :key="channel.code"
                                    class="lab-payment-method-card"
                                    :class="{ 'is-selected': paymentChannelCode === channel.code, 'is-unavailable': channel.available===false }"
                                    role="radio"
                                    :aria-checked="paymentChannelCode===channel.code"
                                    :aria-disabled="channel.available===false"
                                    :tabindex="channel.available===false?-1:0"
                                    @click="choosePayment(channel.code)"
                                    @keydown.enter.prevent="choosePayment(channel.code)"
                                    @keydown.space.prevent="choosePayment(channel.code)"
                                >
                                    <strong class="lab-payment-method-name">{{channel.name}}</strong>
                                    <span class="lab-payment-method-total">{{amount(channel)}}</span>
                                </div>
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

/* Isolated method grid: the global LFAMILIA CSS forces 40px buttons.
   These non-button radio cards are sized entirely within Checkout Lab. */
.lab-payment-amount {
  flex: 0 0 auto;
  display: inline-block;
  margin-left: auto;
  color: #e2efff;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.lab-payment-method-grid {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  padding: 14px;
  border-top: 1px solid rgba(190, 213, 240, .14);
  background: rgba(4, 12, 25, .22);
}
.lab-payment-method-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 17px;
  min-height: 110px;
  width: 100%;
  min-width: 0;
  height: auto;
  padding: 14px;
  border: 1px solid rgba(166, 190, 226, .28);
  border-radius: 11px;
  background: linear-gradient(145deg, #303f53, #263448);
  color: #eff5ff;
  cursor: pointer;
  text-align: left;
  user-select: none;
}
.lab-payment-method-card.is-selected {
  border-color: #a6cdfd;
  background: linear-gradient(145deg, #36547b, #293d5b);
  box-shadow: inset 0 0 0 1px rgba(185, 219, 255, .22);
}
.lab-payment-method-card.is-unavailable {
  opacity: .48;
  cursor: not-allowed;
}
.lab-payment-method-card:focus-visible {
  outline: 2px solid #add4ff;
  outline-offset: 2px;
}
.lab-payment-method-name {
  display: block;
  width: 100%;
  min-width: 0;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 850;
  overflow-wrap: anywhere;
  white-space: normal;
}
.lab-payment-method-total {
  display: block;
  width: 100%;
  min-width: 0;
  padding-top: 10px;
  border-top: 1px solid rgba(215, 231, 255, .22);
  color: #f3f8ff;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
@media (max-width: 390px) {
  .lab-payment-method-grid { gap: 9px; padding: 10px; }
  .lab-payment-method-card { padding: 12px 10px; gap: 15px; }
  .lab-payment-method-name { font-size: 11px; }
  .lab-payment-method-total { font-size: 12px; }
}

</style>
