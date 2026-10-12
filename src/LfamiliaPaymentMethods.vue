<!-- Payment source ported from LFAMILIA-STORE/main: rebuild/resources/js/Pages/Catalog/Show.vue
     Uses the ORIGINAL lf-payment-* classes from rebuild/resources/css/app.css.
     Only wallet label and guest copy adapt to the lab demo. No backend calls. -->
<script setup>
import { computed } from 'vue';

const props = defineProps({
  paymentChannels: { type: Array, default: () => [] },
  selectedCode: { type: String, default: '' },
  customer: { type: Object, default: null },
});
const emit = defineEmits(['select']);
const paymentChannels = computed(() => props.paymentChannels || []);
const paymentChannelCode = computed(() => props.selectedCode);
const customer = computed(() => props.customer);
const formatIdr = n => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
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
                                    <span class="lf-payment-channel-copy">
                                        <strong>{{channel.name}}</strong>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
</template>
