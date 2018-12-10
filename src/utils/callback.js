import { Toast } from 'mint-ui';

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
