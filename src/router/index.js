import Vue from 'vue';
import Router from 'vue-router';

import test from '../views/test';
/* eslint-disable */
const Login = () => import( /* webpackChunkName: "login" */ '../views/login/login.vue');
const Home = () => import( /* webpackChunkName: "home" */ '../views/layout/home.vue');
const batterys = () => import( /* webpackChunkName: "batterys" */ '../views/batterys/batterys.vue');
const position = () => import( /* webpackChunkName: "positions" */ '../views/positions/position.vue');
const historys = () => import( /* webpackChunkName: "historys" */ '../views/history/history.vue');
const fences = () => import( /* webpackChunkName: "fences" */ '../views/fence/fence.vue');
const batteryList = () => import( /* webpackChunkName: "batteryList" */ '../views/batteryList/batteryList.vue');
const alarm = () => import( /* webpackChunkName: "alarm" */ '../views/alarm/alarm.vue');
const userMg = () => import( /* webpackChunkName: "userMg" */ '../views/userManage/userMg.vue');
const devices = () => import( /* webpackChunkName: "device" */ '../views/device/device.vue');
const addDevices = () => import( /* webpackChunkName: "addDevices" */ '../views/add/device.vue');
const userInfo = () => import( /* webpackChunkName: "userInfo" */ '../views/user/users.vue');
const password = () => import( /* webpackChunkName: "password" */ '../views/password/password.vue');
const alarms = () => import( /* webpackChunkName: "alarms" */ '../views/alarmPosition/alert.vue');
const googleHis = () => import( /* webpackChunkName: "googleHis" */ '../views/google/googleHistory.vue');
const googleFence = () => import( /* webpackChunkName: "googleFence" */ '../views/google/googleFence.vue');
const googleAbno = () => import( /* webpackChunkName: "googleAbno" */ '../views/google/googleAbno.vue');
const googlePosition = () => import( /* webpackChunkName: "googlePosition" */ '../views/google/googlePsition.vue');
const policyCom = () => import( /* webpackChunkName: "policy" */ '../views/policy/index.vue');

Vue.use(Router);

export default new Router({
  /* eslint-disable */
  routes: [{
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [{
          path: '/home',
          name: 'home',
          component: batterys,
        },
        {
          path: '/position',
          name: 'position',
          component: position
        },
        {
          path: '/history',
          name: 'history',
          component: historys
        },
        {
          path: '/fence',
          name: 'fence',
          component: fences
        },
        {
          path: '/batteryList',
          name: 'batteryList',
          component: batteryList
        },
        {
          path: '/alarmdata',
          name: 'alarmdata',
          component: alarm
        },
        {
          path: '/userManage',
          name: 'userManage',
          component: userMg
        },
        {
          path: '/device',
          name: 'device',
          component: devices
        },
        {
          path: '/addevice',
          name: 'addevice',
          component: addDevices
        },
        {
          path: '/user',
          name: 'user',
          component: userInfo
        },
        {
          path: '/password',
          name: 'password',
          component: password
        },
        {
          path: '/abnormal',
          name: 'abnormal',
          component: alarms
        },
        {
          path: '/test',
          name: 'test',
          component: test
        }, {
          path: '/goghistory',
          name: 'goghistory',
          component: googleHis
        }, {
          path: '/gogfence',
          name: 'gogfence',
          component: googleFence
        }, {
          path: '/gooAbno',
          name: 'gooAbno',
          component: googleAbno
        }, {
          path: '/gogPosition',
          name: 'gogPosition',
          component: googlePosition
        }, {
          path: '/policy',
          name: 'policy',
          component: policyCom
        }
      ]
    }
  ]
});
