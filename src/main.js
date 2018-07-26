// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import {
  Button,
  Header
} from 'mint-ui';
import Vuex from "vuex";
import FastClick from 'fastclick';
import 'mint-ui/lib/style.css';
import App from './App';
import router from './router';
import './config/rem';
import '../static/icon/iconfont.css';
import createStore from './store/store';

Vue.config.productionTip = false;
FastClick.attach(document.body);
Vue.use(Vuex);
Vue.component(Header.name, Header);
Vue.component(Button.name, Button);
const store = createStore();
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App,
  },
  template: '<App/>',
});
