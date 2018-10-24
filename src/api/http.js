import Axios from "axios";
import {
  Toast
} from 'mint-ui';
import i18n from "../i18n";

console.log("i18n======>", i18n.t('internetErr'));
// let BaseUrl = "http://192.168.1.135:8181";
const BaseUrl = "http://47.98.232.46:8181";

Axios.defaults.withCredentials = true; // 让ajax携带cookie

Axios.interceptors.request.use(config => {
  // 这里的config包含每次请求的内容
  // config.headers['Access-Control-Allow-Headers'] = '*';
  // let token = sessionStorage.getItem('token');
  // if (token) {
  //   config.headers.token = `${token}`;
  // }
  config.withCredentials = true;
  return config;
}, err => {
  return Promise.reject(err);
});

Axios.interceptors.response.use(response => {
  return response;
}, error => {
  return Promise.resolve(error.response);
});

function checkStatus(response) {
  // 如果http状态码正常，则直接返回数据

  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    let result = response.data.code;
    if (result === -1 || result === 1 || result === 4001 || result === 4002 || result === 5001 || result === 5002) {
      return {
        status: result,
        msg: response.data.msg
      };
    }
    if (result === 0 || result === 2) {
      // code = 0时 请求正常，正常返回
      return response;
    }
  } else {
    // 异常状态下，把错误信息返回去
    Toast(`${i18n.t('internetErr')}`);
    return {
      status: 500,
      msg: `${i18n.t('internetErr')}`
    };
  }
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -1) {
    Toast(`${i18n.t('responseCode.internetErr')}`);
  }
  if (res.status === 4001) {
    Toast(`${i18n.t('responseCode.hasdevice')}`);
  }
  if (res.status === 4002) {
    Toast(`${i18n.t('responseCode.notFindDevice')}`);
  }
  if (res.status === 5001) {
    Toast(`${i18n.t('responseCode.hasHost')}`);
  }
  if (res.status === 5002) {
    Toast(`${i18n.t('responseCode.noHost')}`);
  }
  if (res.status === 1) {
    Toast(`${i18n.t('responseCode.timeOut')}`);
    setTimeout(() => {
      window.location.href = '#/login';
      localStorage.clear();
    }, 1000);
  }
  return res;
}
const timeout = 30000; // 超时时间
export default {
  post(url, data) { //  post
    return Axios({
      method: 'post',
      baseURL: BaseUrl,
      url,
      data: JSON.stringify(data),
      timeout: timeout,
      headers: {
        'Content-Type': "application/json"
      }
    }).then((response) => {
      return checkStatus(response);
    }).then((res) => {
      return checkCode(res);
    });
  }
};
