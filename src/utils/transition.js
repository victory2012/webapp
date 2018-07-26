// const replaceTime = (time) => {
//   /* eslint-disable */
//   return time.replace(/\-/g, "/");
// };

export function timeFormat(time) {
  if (!time) return;
  let timeDate = new Date(time);
  let year = timeDate.getFullYear();
  let mounth = timeDate.getMonth() + 1;
  let day = timeDate.getDate();
  let hours = timeDate.getHours();
  let minute = timeDate.getMinutes();
  let second = timeDate.getSeconds();
  mounth = mounth < 10 ? `0${mounth}` : mounth;
  day = day < 10 ? `0${day}` : day;
  hours = hours < 10 ? `0${hours}` : hours;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;
  return `${year}-${mounth}-${day} ${hours}:${minute}:${second}`;
}

export function yymmdd(time) {
  if (!time) return;
  let timeDate = new Date(time);
  let year = timeDate.getFullYear();
  let mounth = timeDate.getMonth() + 1;
  let day = timeDate.getDate();
  mounth = mounth < 10 ? `0${mounth}` : mounth;
  day = day < 10 ? `0${day}` : day;
  return `${year}-${mounth}-${day}`;
}


export function hhmmss(time) {
  if (!time) return;
  let timeDate = new Date(time);
  let hours = timeDate.getHours();
  let minute = timeDate.getMinutes();
  let second = timeDate.getSeconds();
  hours = hours < 10 ? `0${hours}` : hours;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;
  return `${hours}:${minute}:${second}`;
}

export function timeFormatSort(time) {
  if (!time) return;
  let timeDate = new Date(time);
  let year = timeDate
    .getFullYear()
    .toString()
    .substring(2, 4);
  let mounth = timeDate.getMonth() + 1;
  let day = timeDate.getDate();
  let hours = timeDate.getHours();
  let minute = timeDate.getMinutes();
  let second = timeDate.getSeconds();
  mounth = mounth < 10 ? `0${mounth}` : mounth;
  day = day < 10 ? `0${day}` : day;
  hours = hours < 10 ? `0${hours}` : hours;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;
  return `${year}${mounth}${day}${hours}${minute}${second}`;
  // return year + "" + mounth + "" + day + "" + hours + "" + minute + "" + second;
}
export function timeFormats(time) {
  if (!time) return;
  let timeDate = new Date(time);
  let year = timeDate.getFullYear();
  let mounth = timeDate.getMonth() + 1;
  let day = timeDate.getDate();
  let hours = timeDate.getHours();
  let minute = timeDate.getMinutes();
  let second = timeDate.getSeconds();
  mounth = mounth < 10 ? `0${mounth}` : mounth;
  day = day < 10 ? `0${day}` : day;
  hours = hours < 10 ? `0${hours}` : hours;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;
  return `${year}-${mounth}-${day} ${hours}:${minute}:${second}`;
  // return year + "-" + mounth + "-" + day + "  " + hours + ":" + minute + ":" + second;
}

export function trakTimeformat(str) {
  if (!str) return;
  let yy = str.substring(0, 2);
  let mm = str.substring(2, 4);
  let day = str.substring(4, 6);
  let hour = str.substring(6, 8);
  let minute = str.substring(8, 10);
  let seconds = str.substring(10, 12);
  return `20${yy}-${mm}-${day} ${hour}:${minute}:${seconds}`;
}

export function yesTody() {
  let str = new Date();
  let yy = str.getFullYear();
  let mm = str.getMonth() + 1;
  let day = str.getDate() - 1;
  // let hours = str.getHours();
  // let minute = str.getMinutes();
  // let second = str.getSeconds();
  // return `${yy}-${mm}-${day} ${hours}:${minute}:${second}`;
  return `${yy}-${mm}-${day} 00:00:00`;
}

export function userRole(str) {
  switch (str) {
    case "plat_super_admin":
      return "超级管理员";
    case "super_admin":
      return "超级管理员";
    case "admin":
      return "管理员";
    case "customer_super_admin":
      return "管理员";
    case "manufacturer_super_admin":
      return "管理员";
    default:
      return "";
  }
}
export function companyRole(str) {
  switch (str) {
    case "platform":
      return "平台";
    case "manufacturer":
      return "生产商";
    case "customer":
      return "客户";
    case "admin":
      return "客户";
    default:
      return "";
  }
}
export function sortGps(str) {
  let pos = str.toString().split('.');
  let las = pos[1].substring(0, 6);
  let result = `${pos[0]}.${las}`;
  return result;
}
