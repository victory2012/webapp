// import {
//   Message
// } from 'element-ui';
import { Toast } from 'mint-ui';

export function onTimeOut(route) {
  // MessageBox.warning({
  //   message: "登录超时，请重新登录"
  // });
  Toast({
    message: '登录超时，请重新登录',
    position: 'middle',
    duration: 1500
  });
  route.push({
    path: "/login"
  });
  localStorage.removeItem('loginData');
}
export function onError(msg) {
  return Toast({
    message: msg,
    position: 'middle',
    duration: 2000
  });
}
export function onErrors(msg) {
  return Toast({
    message: msg,
    position: 'middle',
    duration: 10000
  });
}
export function onSuccess(msg) {
  return Toast({
    message: msg,
    position: 'middle',
    duration: 2000,
    iconClass: 'icon icon-success'
  });
}
export function onWarn(msg) {
  return Toast({
    message: msg,
    position: 'middle',
    duration: 2000,
    iconClass: 'icon icon-success'
  });
}
