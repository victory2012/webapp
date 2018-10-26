module.exports = {
  platform: 'Plat',
  manufacturer: 'Manufacturer',
  customer: 'Customer',
  internetErr: 'Service request time out, please try again later.',
  mapError: 'Map failed to load, please check network connection.',
  responseCode: {
    timeOut: 'Login time out, please try again later.',
    sessionOut: 'Current session has expired.', // 会话过期
    accountExists: "This user account already exists.", // 账号已存在
    accountNotExist: "This user account does not exist.", // 账号不存在
    accountOperation: "Operation cannot be performed by current user account.", // 账号操作失败
    UnableDevice: 'Unable to operate on this device.', // 设备操作失败
    hasdevice: 'This device already exists.', // 设备已存在
    notFindDevice: 'This device was not found.', // 设备未找到
    hasHost: 'This battery already exists.', // 宿主已存在
    noHost: 'This battery was not found.', // 宿主未找到
    UnableBattery: 'Unable to operate on this battery.', // 宿主操作失败
    UnableGecfence: 'Unable to set up this geofence.' // 电子围栏操作失败
  },
  loginMsg: {
    userNameMsg: 'Please enter user name.',
    password: 'Please enter password.',
    projectName: 'Battery Operation Management System',
    subProjectName: 'Battery Tracking Management System',
    RMaccount: 'Remember user id.',
    RMpassword: 'Remember password.',
    accountPlace: 'User Id',
    passwordPlace: 'Password',
    loginBtn: 'Login',
    errorMsg: {
      account: 'The entry field of user id cannot be empty.',
      password: 'The entry field of passwod cannot be empty.',
    },
    tips: 'Tips',
    sortage: 'Please close the seamless mode before you visit.'
  },
  userInfo: {
    userMsg: 'User Profile',
    pasword: 'Change Password',
    logOut: 'Logout'
  },
  menu: { // 菜单列表
    overview: 'Overview',
    realposition: 'Real Location',
    history: 'Motion Track',
    fence: 'Geofence',
    batteryManage: 'Battery Management',
    batteryList: 'Battery Profile',
    alarm: 'Battery Alarm',
    userManage: "User Management",
    device: 'Device Management'
  },
  overview: {
    total: 'All',
    online: 'This Month',
    offLine: 'Valid',
    invalid: 'Invalid'
  },
  positions: {
    title1: 'Device Profile',
    title2: 'Online Battery List',
    lookAll: 'View All',
    track: 'Motion Track',
    onLine: 'Online',
    offline: 'Offline',
    batteryCode: 'Battery Id',
    deviceCode: 'Device Id',
    updateTime: 'Update Time',
    intersection: 'Road junction',
    latLng: 'Coordinate',
    address: 'Address',
    noDevice: 'There is no corresponding device, please register first.',
    getAdressErr: "Address acquisition failed."
  },
  history: {
    startTime: 'Please enter start time',
    endTime: 'Please enter end time',
    start: 'Start',
    pause: 'Pause',
    continue: 'Continue',
    checkErr: 'Start time must before end time.',
    stop: 'Stop',
    heatActive: 'Hot Zone',
    TrackReplay: 'Playback',
    times: 'Duration',
    batteryList: 'Device Profile',
    noData: "This device has no data during the current time period.",
  },
  pageBtn: {
    previous: 'Previous',
    next: 'Next',
  },
  toggleTip: {
    open: "Open",
    close: 'Close'
  },
  timeBtn: {
    cancle: "Cancel",
    sure: 'Submit'
  },
  fence: {
    cancelSeting: 'Cancel',
    sureSeting: 'Submit',
    back: 'Back',
    addBtn: 'Add',
    delBtn: 'Remove',
    tipMsg: {
      addSuccess: 'Added successfully.',
      delSuccess: 'Removed successfully.',
      addPointer: 'Please select the geofence point on map.',
      selectToDel: 'Please choose the geofence you want remove on map.',
    }
  },
  batteryList: {
    serial: 'No.',
    batteryCode: 'Battery Id',
    binding: 'Binding Status',
    running: 'Operating Status',
    detail: 'Detail',
    online: 'Online',
    offline: 'Offline',
    noBind: 'Unbound',
    hasBind: 'Bound',
    batteryDetail: 'Battery Detail',
    batteryNumber: 'Battery Id',
    model: 'Model',
    specif: 'Specification',
    customer: 'Customer',
    deviceCode: 'Device Id',
    bindStatus: 'Binding Status',
    onlineStatus: 'Online Status'
  },
  alarmList: {
    serial: 'No.',
    time: 'Alarm Time',
    batteryCode: 'Battery Id',
    content: 'Alarm Description',
    handle: 'Action',
    detail: 'Detail',
    batteryDetail: 'Battery Profile',
    batteryNumber: 'Battery Id',
    specif: 'Specification',
    customer: 'Customer',
    deviceCode: 'Device Id',
    grid: 'Coordinate',
    position: 'Location',
    location: 'View'
  },
  useMsg: {
    serial: 'No.',
    name: 'User Id',
    accountIdentity: 'Account Type',
    companyIdentity: 'Company Type',
    detail: 'Detail',
    administrator: 'Administrator',
    superAdministrator: 'Super Administrator',
    userDetail: 'User Profile',
    userName: 'User Id',
    accountRole: 'Account Type',
    enterpriseRole: 'Company Type',
    enterpriseName: 'Company Name',
    phone: 'Mobile',
    email: 'Email'
  },
  device: {
    serial: 'No.',
    deviceCode: 'Device Id',
    bindStatus: 'Binding Status',
    runStatus: 'Operating Status',
    detail: 'Detail',
    deviceDetail: 'Device Profile',
    manufacturerName: 'Company Name',
    createTime: 'Create Time',
    batteryCode: 'Battery Id',
    onlineStatus: 'Online Status',
    device: 'Device Id',
    location: 'View',
    addDevice: 'New Device',
    nobind: 'Unbound',
    hasbind: 'Bound',
    online: 'Offline',
    offline: 'Online'
  },
  addDevice: {
    title: 'New Device',
    back: 'Back',
    deviceCode: 'Device Id',
    manufacturer: 'Manufacturer',
    Customer: 'Customer',
    createBtn: 'Create',
    noData: 'Empty',
    errorTip: "Please enter device id.",
    success: 'Created successfully.'
  },
  user: {
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    userName: 'User Id',
    userRole: 'Account Type',
    enterpriseRole: 'Company Type',
    enterpriseName: 'Company Name',
    phone: 'Mobile',
    email: 'Email',
    no: 'no',
    seccess: 'Update successfully.'
  },
  password: {
    new: 'New Password',
    placeholder: 'Please enter new password.',
    changeBtn: 'Change Password',
    error: 'Please enter new password.',
    success: 'Update successfully.'
  },
  googleAbno: {
    return: 'Back',
    title: 'View the current location ',
    OUT: 'OUT',
    Geofence: 'Out of the Geofence.',
    nowPosition: 'Current Location'
  }
};
