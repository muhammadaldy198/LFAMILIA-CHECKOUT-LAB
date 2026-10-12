// Preview-only adapter. Original LFAMILIA Vue components remain unchanged.
import { defineComponent, h, reactive } from 'vue';

const page = reactive({
  props: {
    auth: { user: null },
    storefront: {
      supportWhatsapp: '', supportEmail: '', assets: {
        footer_banner_desktop: { url: 'https://raw.githubusercontent.com/muhammadaldy198/LFAMILIA-STORE/main/rebuild/public/brand/lfamilia-footer-desktop-wordmark.jpg' },
        footer_banner_mobile: { url: 'https://raw.githubusercontent.com/muhammadaldy198/LFAMILIA-STORE/main/rebuild/public/brand/lfamilia-footer-mobile-wordmark.jpg' },
      },
      presentation: { sections: {}, text: {}, typography: {} },
    },
  },
});

export function usePage() { return page; }
export const Head = defineComponent({
  name: 'MockHead', props: { title: String },
  setup(props) {
    if (props.title) document.title = props.title + ' | LFAMILIA CHECKOUT LAB';
    return () => null;
  },
});

export const Link = defineComponent({
  name: 'MockLink', inheritAttrs: false,
  props: { href: { type: String, default: '#' }, as: { type: String, default: 'a' } },
  setup(props, { attrs, slots }) {
    return () => h(props.as === 'button' ? 'button' : 'a', {
      ...attrs,
      href: props.as === 'button' ? undefined : props.href,
      onClick: (event) => {
        if (typeof attrs.onClick === 'function') attrs.onClick(event);
        if (!event.defaultPrevented && props.href.startsWith('/')) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('lab:notice', { detail: 'Link navigasi dinonaktifkan di preview checkout.' }));
        }
      },
    }, slots.default ? slots.default() : []);
  },
});

