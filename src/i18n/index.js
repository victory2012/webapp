import Vue from "vue";
import VueI18n from "vue-i18n";
import zh from "./lang/LangZhCHS";
import en from "./lang/LangEn";

Vue.use(VueI18n);

const messages = {
  CN: zh,
  EN: en
};

const i18n = new VueI18n({
  locale: localStorage.getItem("locale") || "CN",
  // fallbackLocale: 'CN',
  messages
});
export default i18n;
