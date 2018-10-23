import Vue from "vue";
import VueI18n from "vue-i18n";
import zh from './lang/LangZhCHS';
import en from './lang/LangEn';
// import enLocale from 'element-ui/lib/locale/lang/en'
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
// import locale from 'element-ui/lib/locale';

Vue.use(VueI18n);

const messages = {
  CN: zh,
  EN: en
};

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'CN',
  // fallbackLocale: 'CN',
  messages
});
export default i18n;
