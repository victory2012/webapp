import Axios from 'axios';
import { Toast } from 'mint-ui';
import router from '../router';
import i18n from '../i18n';

// let BaseUrl = "http://192.168.1.135:8181";
const BaseUrl = 'http://47.98.232.46:8181';

Axios.defaults.withCredentials = true; // 让ajax携带cookie

Axios.interceptors.request.use(
  config => {
    // 这里的config包含每次请求的内容
    // config.headers['Access-Control-Allow-Headers'] = '*';
    // let token = sessionStorage.getItem('token');
    // if (token) {
    //   config.headers.token = `${token}`;
    // }
    config.withCredentials = true;
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

Axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.resolve(error.response);
  }
);

function checkStatus(response) {
  // 如果http状态码正常，则直接返回数据
  if (
    response &&
    (response.status === 200 ||
      response.status === 304 ||
      response.status === 400)
  ) {
    return response;
  } else {
    // 异常状态下，把错误信息返回去
    Toast(`${i18n.t('internetErr')}`);
    return { status: response.status, msg: `${i18n.t('internetErr')}` };
  }
}

function switchCode(code) {
  switch (code) {
    case 1:
      setTimeout(() => {
        router.push('/login');
        sessionStorage.clear();
      }, 1000);
      return Toast(`${i18n.t('responseCode.sessionOut')}`);
    case 1001:
      return Toast(`${i18n.t('responseCode.accountExists')}`);
    case 1002:
      return Toast(`${i18n.t('responseCode.accountNotExist')}`);
    case 1003:
      return Toast(`${i18n.t('responseCode.accountOperation')}`);
    case 1004: // 账户密码错误
      return Toast(`${i18n.t('responseCode.accountPwdErr')}`);
    case 4003:
      return Toast(`${i18n.t('responseCode.UnableDevice')}`);
    case 4001:
      return Toast(`${i18n.t('responseCode.hasdevice')}`);
    case 4002:
      return Toast(`${i18n.t('responseCode.notFindDevice')}`);
    case 5001:
      return Toast(`${i18n.t('responseCode.hasHost')}`);
    case 5002:
      return Toast(`${i18n.t('responseCode.noHost')}`);
    case 5003:
      return Toast(`${i18n.t('responseCode.UnableBattery')}`);
    case 6023:
      return Toast(`${i18n.t('responseCode.UnableGecfence')}`);
    // case -1:
    //   return Toast(`${i18n.t('responseCode.UnableGecfence')}`);
    default:
      break;
  }
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  let status = res.data.code;
  if (status !== 0) {
    Toast(switchCode(status));
  }
  return res;
}

const timeout = 100000; // 超时时间
export default {
  post(url, data) {
    //  post
    return Axios({
      method: 'post',
      baseURL: BaseUrl,
      url,
      data: JSON.stringify(data),
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        return checkStatus(response);
      })
      .then(res => {
        return checkCode(res);
      });
  }
};
