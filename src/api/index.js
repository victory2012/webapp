import http from "./http";


// let BaseUrl = "http://192.168.1.135:8181";
const socketUrl = 'ws://47.98.232.46:8081/gps';
// Axios.defaults.withCredentials = true; // 让ajax携带cookie

/*
 * 获取电池列表数据
 * params入参 包含pageSize pageNum 两个字段
 */
export function GetList(params) {
  return http.post('/battery/list', params);
}

export function GetCount() {
  return http.post('/device/count');
}

/*
 * 添加电池黑名单
 * params.manufacturer
 * params.customer
 * params.deviceId
 */
export function addBlacklist(params) {
  return http.post(`/device/${params.manufacturer}/${params.customer}/${params.deviceId}/add_blacklist`);
}

/*
 * 删除电池
 * params.manufacturer
 * params.customer
 * params.batteryId
 */
export function deleteBattery(params) {
  return http.post(`/battery/${params.manufacturer}/${params.customer}/${params.batteryId}/delete`);
}

/*
 * 电池登记
 * params.manufacturer
 * params.customer
 * params.deviceId
 */
export function addBattery(params) {
  return http.post(`/battery/add`, params);
}
/*
 * 删除设备
 * params.manufacturer
 * params.customer
 * params.deviceId
 */
export function deleteDevice(params) {
  return http.post(`/device/${params.manufacturer}/${params.customer}/${params.deviceId}/delete`);
}

/*
 * 登录
 * params
 */
export function getAdminInfo(params) {
  return http.post('/login/submit', params);
}

/*
 * 退出登录
 */
export function doLogOut() {
  return http.post('/login/logout');
}

/*
 * 获取gps概览
 */
export function GetDeviceList(params) {
  return http.post('/device/gps/list', params);
}

/*
 * 添加电子围栏
 * params： gpsList 坐标点
 */
export function addFence(params) {
  return http.post('/fence/add', params);
}

/*
 * 刪除电子围栏
 * params：围栏id
 */
export function delFence(fenceId) {
  return http.post(`/fence/${fenceId}/delete`);
}

/*
 * 获取电子围栏
 */
export function getFence() {
  return http.post('/fence/list');
}

/*
 * websocket 请求
 */
export function websockets(callBack) {
  let ws = new WebSocket(socketUrl);
  callBack(ws);
}

/*
 * 获取个人信息
 */
export function getUserInfo() {
  return http.post('/user/info');
}

/*
 * 修改个人信息
 * params入参
 */
export function changeUserInfo(params) {
  return http.post('/user/info/modify', params);
}

/*
 * 修改密码
 * params入参 包含password 字段
 */
export function changePassword(params) {
  return http.post('/user/change_password', params);
}
/*
 * 告警数据
 * @params入参 分页字段
 */
export function alarmList(params) {
  return http.post('/alarm/list', params);
}

/*
 * 获取设备gps 实时位置
 */
export function realTimeLocation(deviceId) {
  return http.post(`/device/${deviceId}/gps/get`);
}

/*
 * 获取所有设备列表
 */
export function deviceList(params) {
  return http.post(`/device/list`, params);
}

/*
 * 获取所有设备列表
 */
export function deviceListOnly() {
  return http.post(`/device/deviceId/list`);
}

/*
 * 获取所有设备列表
 */
export function createDeviceList(params) {
  return http.post(`/device/create`, params);
}

/*
 * 获取历史轨迹
 */
export function GetTrajectory(params) {
  return http.post(`/device/gps/history/list`, params);
}

/*
 * 获取生产企业用户列表
 */
export function manufacturerList(params) {
  return http.post(`/user/list`, params);
}

/*
 * 添加生产企业超级管理员
 */
export function addManufacturer(params) {
  return http.post('/user/manufacturer/add', params);
}

/*
 * 添加生产企业普通管理员
 */
export function addManufacturerAdmin(params) {
  return http.post('/user/manufacturer_admin/add', params);
}

/*
 * 添加客户超级管理员
 */
export function addCustomer(params) {
  return http.post('/user/customer/add', params);
}

/*
 * 添加客户普通管理员
 */
export function addCustomerAdmin(params) {
  return http.post(`/user/customer_admin/add`, params);
}

/*
 * 获取生产企业列表
 */
export function enterpriseList() {
  return http.post('/enterprise/manufacturer/list');
}

/*
 * 获取客户企业列表
 */
export function enterpriseCustomer() {
  return http.post('/enterprise/manufacturer_customer/list');
}

/*
 * 获取客户企业列表
 */
export function singleDeviceId(deviceId) {
  return http.post(`/device/${deviceId}/gps/get`);
}

export function getPolicy() {
  return http.post(`/event_policy/get`);
}

export function updatePolicy(param) {
  return http.post(`/event_policy/update`, param);
}
/* 根据电池id和设备id 获取围栏 */
export function getFenceById(params) {
  return http.post(`/fence/get`, params);
}
