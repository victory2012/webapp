// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import App from '@/App';
import i18n from '@/i18n';
import router from '@/router';
import FastClick from 'fastclick';
import { Button } from 'mint-ui';
import createStore from '@/store/store';
import 'mint-ui/lib/style.css';
import './config/rem';
import '../static/icon/iconfont.css';

Vue.config.productionTip = false;
FastClick.attach(document.body);
Vue.use(Vuex);
Vue.component(Button.name, Button);
const store = createStore();
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: {
    App
  },
  template: '<App/>'
});
