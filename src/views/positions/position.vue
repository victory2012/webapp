<template>
  <div id="outer-box">
    <div id="positions" class="positioned"></div>
    <div class="batteryList" :class="[closed? 'closed': '']">
      <mt-button @click="showAllPionter" type="primary" size="small">查看全部</mt-button>
      <p @click="toggleList" class="controlBtn">{{toggleTip}}</p>
      <ul>
        <li v-for="(item, index) in pointerArr" :class="[ devicelabel == item.deviceId ? 'selected': '', devicelabel == item.batteryId ? 'selected': '' ]" :key="item.deviceId" @click="checkItem(item, index)">
          <p>{{index + 1}}、{{deviceShow? item.deviceId : item.batteryId}}</p>
          <div class="badges" @click.prevent.stop="HistoryTrack(item.batteryId)">
            <span class="hisBad">历史轨迹</span>
            <span class="onlines" :class="[item.onlineStatus === 0? 'off': '']">
              <i>{{item.onLine}}</i>
            </span>
          </div>
        </li>
      </ul>
      <div class="pages">
        <div @click="previous" :class="[previousBtn?'':'disable']">上一页</div>
        <div @click="next" :class="[naxtBtn ? '': 'disable' ]">下一页</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
#outer-box {
  position: absolute;
  top: $baseHeader;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  .positioned {
    height: 100%;
    width: 100%;
  }
  .batteryList {
    position: absolute;
    top: px2rem(10px);
    right: 0;
    width: px2rem(150px);
    z-index: 99;
    background: #fafafa;
    padding: px2rem(6px) px2rem(4px);
    height: auto;
    line-height: px2rem(24px);
    transition: all 0.3s ease-in;
    &.closed {
      right: px2rem(-150px);
    }
    p {
      font-size: px2rem(14px);
    }
    .controlBtn {
      width: 25px;
      position: absolute;
      top: 0;
      left: -25px;
      background: #57050b;
      padding: 4px;
      color: #ffffff;
      font-size: px2rem(12px);
      text-align: center;
    }
    ul {
      width: 100%;
      background: #ffffff;
      height: 400px;
      overflow: scroll;
      li {
        font-size: px2rem(12px);
        padding: px2rem(6px) px2rem(5px);
        position: relative;
        border-bottom: px2rem(1px) solid #f5f5f5;
        &.selected {
          background: green;
          color: #fff;
          .onlines {
            color: #ffffff !important;
          }
        }
        .badges {
          padding-left: 15px;
          position: relative;
          width: 80%;
          .hisBad {
            border: 1px solid #f0f0f0;
            border-radius: 2px;
            padding: 0 4px;
            background: #ffffff;
            color: #333333;
          }
          .onlines {
            // position: absolute;
            // top: 0;
            // right: px2rem(-15px);
            font-size: px2rem(12px);
            color: red;
            &.off {
              color: gray;
            }
          }
        }
      }
    }
    .pages {
      display: flex;
      div {
        font-size: px2rem(12px);
        flex: 1;
        text-align: center;
        &.disable {
          color: #d3d3d3;
        }
      }
    }
  }
}
</style>

<script>
/* eslint-disable */
import AMap from "AMap";
import AMapUI from "AMapUI";
import { Indicator } from "mint-ui";
import { websockets, GetDeviceList } from "../../api/index";
import { timeFormats, trakTimeformat } from "../../utils/transition";
import { onError, onTimeOut } from "../../utils/callback";

let map;
let infoWindow;
let ponterIndex;
let batteryIdArr = {};
let pointerObj = {};
export default {
  data() {
    return {
      pointerArr: [],
      lnglat: "",
      devicelabel: "",
      active: true,
      activeName: 1,
      pageNum: 1,
      total: 10,
      markers: [],
      naxtBtn: true,
      onLineData: [],
      closed: true,
      deviceShow: false,
      previousBtn: false,
      toggleTip: "展开",
      showList: false,
      pathParams: "" // url 中设备id 参数
    };
  },
  methods: {
    next() {
      if (this.pageNum < this.total) {
        Indicator.open();
        this.over();
        this.markers && map.remove(this.markers);
        this.pageNum = this.pageNum + 1;
        this.getListData();
      }
    },
    previous() {
      if (this.pageNum > 1) {
        Indicator.open();
        this.pageNum = this.pageNum - 1;
        this.over();
        this.markers && map.remove(this.markers);
        this.getListData();
      }
    },
    init() {
      map = new AMap.Map("positions", {
        resizeEnable: true,
        zoom: 15
      });
      this.getListData();
      Indicator.open();
    },
    // 打开&&关闭列表
    toggleList() {
      this.closed = !this.closed;
      this.toggleTip = this.closed ? "展开" : "收起";
    },
    getListData() {
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 10
      };
      if (this.deviceShow) {
        pageObj.bindingStatus = "";
      } else {
        pageObj.bindingStatus = 1;
      }
      GetDeviceList(pageObj).then(res => {
        console.log(res.data);
        Indicator.close();
        if (res.data.code === 1) {
          onTimeOut(this.$router);
        }
        if (res.data.code === 0) {
          this.pointerArr = [];
          let result = res.data.data.data;
          this.total = res.data.data.totalPage;
          if (this.total === this.pageNum) {
            this.naxtBtn = false;
          } else {
            this.naxtBtn = true;
          }
          if (this.pageNum === 1) {
            this.previousBtn = false;
          } else {
            this.previousBtn = true;
          }
          let sendData = { api: "bind", param: [] };
          pointerObj = {};
          if (result.length > 0) {
            if (this.pathParams) {
              result.forEach((key, index) => {
                pointerObj[key.deviceId] = `${key.longitude},${key.latitude},${trakTimeformat(key.pushTime)},${key.batteryId},${
                  key.onlineStatus
                },1`;
                if (key.onlineStatus === 1) {
                  key.onLine = "在线";
                  if (key.batteryId) {
                    batteryIdArr[key.deviceId] = key.batteryId;
                  }
                  if (key.deviceId) {
                    sendData.param.push(key.deviceId);
                  }
                } else {
                  key.onLine = "离线";
                }
                // pathParams 路由传参。为设备id
                if (this.pathParams === key.deviceId) {
                  let opts = {
                    deviceId: this.pathParams,
                    longitude: key.longitude,
                    latitude: key.latitude
                  }
                  this.checkItem(opts, index);
                }
                this.pointerArr.push(key);
              });
              this.sockets(JSON.stringify(sendData));
            } else {
              this.mapInit(result);
            }
          } else {
            onError("暂无设备, 请先注册设备");
          }
        }
        if (res.data.code === -1) {
          onError(res.data.msg);
        }
      });
    },
    // websockets 请求
    sockets(result) {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          ws.send(result);
        };
        ws.onmessage = evt => {
          let data = JSON.parse(evt.data);
          console.log(data);
          if (data.code === 2) {
            // code 为 1时 既绑定成功，2时为 收到了数据
            if (this.markers.length > 0) {
              // 收到websocket推送过来的数据时，如果地图上有mark点 就先清除掉。
              map.remove(this.markers);
            }
            let obj = data.data.split(",");
            let battery = batteryIdArr[obj[0]]; // 从电池id 字典中获取电池id，obj[0] 为设备id。
            obj.forEach(() => {
              pointerObj[obj[0]] = `${obj[2]},${
                obj[1]
              },${new Date()},${battery},1`; // pointerObj 对象。其key为设备id（唯一性），value为字符串、依次顺序为经度、纬度、时间、电池id。以逗号隔开
            });
            if (this.deviceId && this.deviceId.toString().length > 5) {
              let keys = Object.keys(pointerObj);
              let nextObj = {};
              keys.forEach(item => {
                if (item === this.deviceId) {
                  nextObj[this.deviceId] = pointerObj[item];
                }
              });
              this.GaoDeMap(nextObj, "fromClick");
            } else {
              this.GaoDeMap(pointerObj, "fromWs");
            }
          }
        };
        ws.onerror = () => {
          console.log("onerror...");
          onError("服务器繁忙，请稍后重试。");
          this.over();
        };
        ws.onclose = () => {
          console.log("closed...");
        };
        this.over = () => {
          ws.close();
        };
      });
    },
    /*
     @params batteryIdArr 为电池ID对象 key为设备id，value为电池id
     @params pointerObj 电池坐标点对象，key为设备id，value为一个字符串，依次顺序为经度、纬度、时间、电池id。以逗号隔开
     */
    mapInit(data) {
      pointerObj = {};
      let sendData = { api: "bind", param: [] };
      data.forEach(key => {
        pointerObj[key.deviceId] = `${key.longitude},${key.latitude},${trakTimeformat(key.pushTime)},${key.batteryId},${key.onlineStatus},0`;
        if (key.onlineStatus === 1) {
          key.onLine = "在线";
          if (key.batteryId) {
            // onlineStatus 判断是否在线的标识。1 在线。0 离线；
            sendData.param.push(key.deviceId);
            batteryIdArr[key.deviceId] = key.batteryId; // 制作电池id 字典。以设备id作为key，电池id作为value。
          }
        } else {
          key.onLine = "离线";
        }
        this.pointerArr.push(key);
      });
      this.sockets(JSON.stringify(sendData));
      this.GaoDeMap(pointerObj);
    },
    GaoDeMap(data, fromWs) {
      this.markers && map.remove(this.markers);
      let allmarkerArr = Object.values(data);
      let markerkeys = Object.keys(data);
      for (let i = 0; i < allmarkerArr.length; i++) {
        let lngs = allmarkerArr[i].toString().split(",");
        if (lngs[0].length > 6 && lngs[1].length > 6 && lngs[4] === "1") {
          let marker = new AMap.Marker({
            position: [lngs[0], lngs[1]],
            offset: new AMap.Pixel(-12, -12),
            zIndex: 101,
            extData: {
              position: `${lngs[0]},${lngs[1]}`,
              times: lngs[2]
            },
            map: map
          });
          if (lngs[5] === "0") {
            marker.setIcon('../../../static/img/gray.png');
          } else {
            marker.setIcon(
              `http://webapi.amap.com/theme/v1.3/markers/n/mark_b${i + 1}.png`
            );
          }
          if (fromWs === "fromClick") {
            marker.setIcon(
              `http://webapi.amap.com/theme/v1.3/markers/n/mark_r${ponterIndex}.png`
            );
          }
          marker.setLabel({
            offset: new AMap.Pixel(15, 20),
            content: `电池编号：${lngs[3]}<br/>设备编号：${markerkeys[i]}`
          });
          this.markers.push(marker);
        }
      }
      Indicator.close();
      if (this.markers.length > 0) {
        AMapUI.loadUI(["misc/PositionPicker"], PositionPicker => {
          let positionPicker = new PositionPicker({
            mode: "dragMarker",
            map: map,
            iconStyle: {
              url: "../../static/img/iocna.png",
              size: [1, 1],
              ancher: [1, 1]
            }
          });
          this.markers.forEach(key => {
            key.on("click", () => {
              let pointerData = key.getExtData();
              let point = pointerData.position.split(",");
              let position = new AMap.LngLat(point[0], point[1]);
              positionPicker.start(position);
              positionPicker.on("success", result => {
                let info = [];
                info.push(
                  `<div><div style="font-size: 14px;">更新时间：${timeFormats(
                    pointerData.times
                  )};</div>`
                );
                info.push(
                  `<div style="font-size:14px;">路口 :${
                    result.nearestJunction
                  };</div>`
                );
                info.push(
                  `<div style="font-size:14px;">地址 :${
                    result.address
                  }</div></div>`
                );
                infoWindow = new AMap.InfoWindow({
                  content: info.join(""), // 使用默认信息窗体框样式，显示信息内容
                  autoMove: false,
                  offset: new AMap.Pixel(0, -10)
                });
                infoWindow.open(map, position);
              });
            });
            map.on("click", () => {
              infoWindow && infoWindow.close();
            });
          });
        });
      }
      if (!fromWs) {
        map.setFitView(); // 自适应地图
      }
    },
    /*
    * @params deviceId 电池列表 获取的设备id。
    * @params index 为列表的索引。这里取这个索引是为了让地图的mark点 显示点的是第几个。
     */
    checkItem(item, index) {
      if (item.onlineStatus === 0) return;
      map.setCenter(new AMap.LngLat(item.longitude, item.latitude));
      this.devicelabel = item.deviceId;
      this.deviceId = item.deviceId;
      this.showTip = item.batteryId;
      this.toggleList();
      ponterIndex = index + 1;
      infoWindow && infoWindow.close(); // infoWindow 高德地图 数据展示框。
      if (this.deviceId && pointerObj) {
        let keys = Object.keys(pointerObj);
        // let nextObj = {};
        if (this.markers.length > 0) {
          map.remove(this.markers);
        }
        let selectObj = {};
        keys.forEach(items => {
          if (items === this.deviceId) {
            selectObj[items] = pointerObj[items];
          }
        });
        console.log(selectObj);
        this.GaoDeMap(selectObj, "fromClick");
      }
    },
    // 查看所有点
    showAllPionter() {
      this.devicelabel = null;
      this.deviceId = null;
      this.GaoDeMap(pointerObj, "fromWs");
    },
    // 查看历史轨迹。路由传参 设备id
    HistoryTrack(batteryId) {
      this.$router.push({
        path: "history",
        query: { batteryId: batteryId }
      });
    }
  },
  /*
  * 用beforeRouteEnter 这个路由钩子函数 来判断是从哪个路由跳转过来的
  * 以此来处理列表显示内容
  */
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.name === "device" && vm.pathParams) {
        vm.titles = "设备列表";
        vm.deviceShow = true;
      }
      if (from.name === "batteryList" && vm.pathParams) {
        vm.titles = "在线电池列表";
        vm.deviceShow = false;
      }
    });
  },
  beforeDestroy() {
    console.log("beforeDestroy");
    map.destroy();
    this.over();
  },
  mounted() {
    this.init();
  },
  created() {
    this.pathParams = this.$route.query.deviceId; // 路由参数
  }
};
</script>
