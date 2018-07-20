// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import MintUI from 'mint-ui';
import 'mint-ui/lib/style.css';
import ElementUI from 'element-ui';
import FastClick from 'fastclick';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import router from './router';
import './config/rem';
import '../static/icon/iconfont.css';

FastClick.attach(document.body);
Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(MintUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App,
  },
  template: '<App/>',
});