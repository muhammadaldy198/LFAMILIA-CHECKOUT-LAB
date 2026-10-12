<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

defineProps({
  vouchers: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'apply']);
const closeButton = ref(null);
function onKeydown(event) {
  if (event.key === 'Escape') emit('close');
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  closeButton.value?.focus();
});
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <!-- Teleport keeps voucher modal outside CustomerShell's global button/CSS rules. -->
  <Teleport to="body">
    <div class="lab-offer-backdrop" @click.self="emit('close')">
      <section class="lab-offer-modal" role="dialog" aria-modal="true" aria-labelledby="lab-offer-heading">
        <header class="lab-offer-heading">
          <div class="lab-offer-heading-copy">
            <span>EXCLUSIVE OFFERS</span>
            <h2 id="lab-offer-heading">Pilih Voucher Diskon</h2>
          </div>
          <button ref="closeButton" type="button" class="lab-offer-close" aria-label="Tutup voucher" @click="emit('close')">×</button>
        </header>
        <p class="lab-offer-description">Voucher berikut hanya untuk simulasi checkout.</p>
        <div class="lab-offer-list">
          <article v-for="item in vouchers" :key="item.code" class="lab-offer-card">
            <div class="lab-offer-icon" aria-hidden="true">%</div>
            <div class="lab-offer-copy">
              <strong>{{ item.name }}</strong>
              <span>{{ item.detail }}</span>
              <code>{{ item.code }}</code>
            </div>
            <button type="button" class="lab-offer-apply" :aria-label="'Pakai voucher '+item.code" @click="emit('apply',item.code)">Pakai <span aria-hidden="true">→</span></button>
          </article>
        </div>
        <p class="lab-offer-disclaimer">Tidak berlaku di LFAMILIA STORE production.</p>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.lab-offer-backdrop, .lab-offer-backdrop * { box-sizing: border-box; }
.lab-offer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  background: rgba(3, 7, 18, .82);
  backdrop-filter: blur(8px);
  color: #f1f5ff;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.lab-offer-modal {
  width: min(100%, 460px);
  max-height: min(700px, calc(100dvh - 32px));
  overflow-y: auto;
  border: 1px solid rgba(139, 169, 221, .34);
  border-radius: 18px;
  padding: 22px;
  background: linear-gradient(155deg, #202d47 0%, #111b2d 100%);
  box-shadow: 0 20px 60px #000a;
}
.lab-offer-heading {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-start;
}
.lab-offer-heading-copy { min-width: 0; }
.lab-offer-heading-copy > span {
  display: block;
  color: #9dbaff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .15em;
}
.lab-offer-heading-copy h2 {
  margin: 8px 0 0;
  font-size: clamp(18px, 4.5vw, 22px);
  line-height: 1.3;
  font-weight: 850;
}
.lab-offer-close {
  display: grid;
  place-items: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid #ffffff27;
  color: #dee7fa;
  background: #ffffff0d;
  font-size: 23px;
  cursor: pointer;
}
.lab-offer-description {
  font-size: 12px;
  line-height: 1.5;
  margin: 16px 0 18px;
  color: #b6c5dd;
}
.lab-offer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lab-offer-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 13px;
  border: 1px solid #9fbaf043;
  border-radius: 12px;
  background: #2b3b55;
}
.lab-offer-card:nth-child(even) {
  border-color: #b5a2ed50;
  background: #363154;
}
.lab-offer-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #a5bfff20;
  color: #c9d8fb;
  font-size: 23px;
  font-weight: 900;
}
.lab-offer-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  line-height: 1.35;
}
.lab-offer-copy strong {
  font-size: 13px;
  color: #f4f7ff;
  font-weight: 850;
  overflow-wrap: anywhere;
}
.lab-offer-copy > span {
  font-size: 11px;
  color: #b6c6df;
  overflow-wrap: anywhere;
}
.lab-offer-copy code {
  align-self: flex-start;
  max-width: 100%;
  margin-top: 2px;
  color: #d6e9ff;
  font: 800 10px/1.3 ui-monospace, monospace;
  overflow-wrap: anywhere;
}
.lab-offer-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 0 0 auto;
  min-width: 65px;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid #9cbefd60;
  border-radius: 9px;
  background: #5475ba;
  color: white;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
}
.lab-offer-apply:hover, .lab-offer-apply:focus-visible { background: #6489d1; }
.lab-offer-disclaimer {
  margin: 17px 0 0;
  color: #9cabc2;
  text-align: center;
  font-size: 10px;
  line-height: 1.5;
}
@media (max-width: 370px) {
  .lab-offer-modal { padding: 17px; }
  .lab-offer-card { grid-template-columns: 34px minmax(0,1fr) auto; gap: 8px; padding: 10px; }
  .lab-offer-icon { width: 34px; height: 34px; font-size: 19px; }
  .lab-offer-apply { min-width: 54px; padding: 6px; font-size: 10px; }
}
</style>
