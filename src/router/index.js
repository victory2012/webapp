import Vue from 'vue';
import Router from 'vue-router';

const Login = () => import(/* webpackChunkName: "login" */ '../views/login/login.vue');
const Home = () => import(/* webpackChunkName: "home" */ '../views/layout/home.vue');
const batterys = () => import(/* webpackChunkName: "batterys" */ '../views/batterys/batterys.vue');

Vue.use(Router);

export default new Router({
  routes: [
    {
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
      children: [
        {
          path: '/home',
          component: batterys,
        }
      ]
    }
  ]
});
