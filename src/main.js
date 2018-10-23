// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import {
  Button
  // Header
} from 'mint-ui';
/* eslint-disable */
// import jquery from 'jquery';
import Vuex from "vuex";
import FastClick from 'fastclick';
import 'mint-ui/lib/style.css';
import App from './App';
import router from './router';
import createStore from './store/store';
import i18n from "./i18n/index";
import './config/rem';
import '../static/icon/iconfont.css';

import {
  getStorage
} from "./utils/transition";

Vue.config.productionTip = false;
FastClick.attach(document.body);
Vue.use(Vuex);
// Vue.prototype.$ = jquery;
Vue.component(Button.name, Button);
const store = createStore();
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: {
    App,
  },
  template: '<App/>',
  created() {
    let loginData = getStorage('loginData') || "";
    this.$store.commit('LogInDate', loginData);
  }
});
