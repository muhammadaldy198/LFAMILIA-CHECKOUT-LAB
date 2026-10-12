import { createApp, defineComponent, h, ref, Fragment } from 'vue';
import PremiumCheckout from './PremiumCheckout.vue';
import CustomerShell from '../rebuild/resources/js/Components/CustomerShell.vue';
import { demos } from './demo-data.js';
import { installMockApi } from './mock-api.js';
import '../rebuild/resources/css/app.css';
import './premium.css';
import './refinement.css';
import './preview.css';

const current = ref('ml');
installMockApi(() => demos[current.value]);

const Lab = defineComponent({
  name: 'CheckoutLab',
  setup() {
    const notice = ref('');
    window.addEventListener('lab:notice', (event) => { notice.value = String(event.detail || ''); });
    const demoPayment = location.pathname === '/payment';
    return () => h(Fragment, null, [
      demoPayment ? h('main', { class: 'lab-payment' }, [
        h('h1', 'Simulasi pesanan selesai'),
        h('p', 'Ini hanya checkout dummy. Tidak ada pembayaran, order, atau backend asli.'),
        h('a', { href: '/' }, 'Kembali ke preview checkout'),
      ]) : h(CustomerShell, {}, { default: () => h(PremiumCheckout, { key: current.value, ...demos[current.value] }) }),
      h('details', {class:'lab-toolbar'},[
        h('summary','◈ LAB · DEMO'),
        h('div',{class:'lab-toolbar-body'},[
          h('strong','LFAMILIA CHECKOUT LAB'),
          h('span',{class:'lab-indicator'},'DATA DUMMY · TIDAK ADA TRANSAKSI'),
          h('select',{value:current.value,onChange:event=>{current.value=event.target.value},'aria-label':'Pilih produk demo'},[
            h('option',{value:'ml'},'Mobile Legends'),h('option',{value:'ff'},'Free Fire')
          ]),
          h('a',{href:'/'},'Reset preview')
        ])
      ]),
            notice.value ? h('div', { class: 'lab-notice', role: 'status', onClick: () => { notice.value = ''; } }, notice.value) : null,
    ]);
  },
});
createApp(Lab).mount('#app');
