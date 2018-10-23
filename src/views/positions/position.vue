<template>
  <div id="outer-box">
    <!-- <div id="positions" class="positioned"></div> -->
    <google-map :propData="mapData"></google-map>
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
import { mapGetters } from "vuex";
import { Indicator } from "mint-ui";
import { websockets, GetDeviceList } from "../../api/index";
import { timeFormats, trakTimeformat, nowDate } from "../../utils/transition";
import { onError, onTimeOut } from "../../utils/callback";
import googleMap from "./googleMap";

let map;
let infoWindow;
let ponterIndex;
let batteryIdArr = {};
let pointerObj = {};
export default {
  components: {
    googleMap
  },
  data() {
    return {
      mapData: {},
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
    init() {
      this.getListData();
    },
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
    // 打开&&关闭列表
    toggleList() {
      this.closed = !this.closed;
      this.toggleTip = this.closed ? "展开" : "收起";
    },
    // 查看所有点
    showAllPionter() {
      this.devicelabel = null;
      this.deviceId = null;
      this.mapData = {
        data: pointerObj,
        ponterIndex: ponterIndex,
        type: "fromWs"
      };
      // this.GaoDeMap(pointerObj, "fromWs");
    },
    pageChange() {
      this.over();
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      this.getListData();
    },

    getListData() {
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 10
        // bindingStatus: this.bindingStatus
      };
      if (this.deviceShow) {
        pageObj.bindingStatus = "";
      } else {
        pageObj.bindingStatus = 1;
      }
      GetDeviceList(pageObj).then(res => {
        console.log(res.data);
        if (res.data.code === 1) {
          onTimeOut(this.$router);
        }
        if (res.data.code === 0) {
          this.pointerArr = [];
          let center = res.data.data;
          let result = center.data;
          this.total = center.total;
          let sendData = { api: "bind", param: [] };
          pointerObj = {};
          if (result.length > 0) {
            if (this.pathParams) {
              result.forEach((key, index) => {
                pointerObj[key.deviceId] = `${key.latitude},${
                  key.longitude
                },${trakTimeformat(key.pushTime)},${key.batteryId},${
                  key.onlineStatus
                }`;
                if (key.onlineStatus === 1) {
                  key.onLine = "在线";
                  if (key.batteryId) {
                    batteryIdArr[key.deviceId] = key.batteryId; // 制作电池id 字典。以设备id作为key，电池id作为value。
                  }
                  // if (!this.hasGet) {
                  //   map.setCenter(
                  //     new google.maps.LatLng(key.latitude, key.longitude)
                  //   );
                  // } else {
                  //   this.hasGet = true;
                  // }
                  if (key.deviceId) {
                    sendData.param.push(key.deviceId);
                  }
                  // pathParams 路由传参。为设备id
                } else {
                  key.onLine = "离线";
                }
                if (this.pathParams === key.deviceId) {
                  let opts = {
                    deviceId: this.pathParams,
                    longitude: key.longitude,
                    latitude: key.latitude
                  };
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
    sockets(data) {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          ws.send(data);
        };
        ws.onmessage = evt => {
          let data = JSON.parse(evt.data);
          if (data.code === 2) {
            // code 为 1时 既绑定成功，2时为 收到了数据
            if (this.markers.length > 0) {
              // 收到websocket推送过来的数据时，如果地图上有mark点 就先清除掉。
              this.markers.forEach(key => {
                key.setMap(null);
              });
              this.markers = [];
            }
            let obj = data.data.split(",");
            let battery = batteryIdArr[obj[0]]; // 从电池id 字典中获取电池id，obj[0] 为设备id。
            obj.forEach(() => {
              pointerObj[obj[0]] = `${obj[1]},${
                obj[2]
              },${nowDate()},${battery},1,1`; // pointerObj 对象。其key为设备id（唯一性），value为字符串、依次顺序为经度、纬度、时间、电池id、在线状态、推送数据标志
            });
            if (this.deviceId || this.pathParams) {
              let keys = Object.keys(pointerObj);
              let nextObj = {};
              keys.forEach((item, index) => {
                if (item === this.deviceId || item === this.pathParams) {
                  nextObj[item] = pointerObj[item];
                }
              });
              this.mapData = {
                data: nextObj,
                ponterIndex: ponterIndex,
                type: "fromClick"
              };
              // this.GaoDeMap(nextObj, "fromClick");
            } else {
              this.mapData = {
                data: pointerObj,
                ponterIndex: ponterIndex,
                type: "fromWs"
              };
              // this.GaoDeMap(pointerObj, "fromWs");
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
      console.log(data);
      data.forEach((key, index) => {
        pointerObj[key.deviceId] = `${key.latitude},${
          key.longitude
        },${trakTimeformat(key.pushTime)},${key.batteryId},${
          key.onlineStatus
        },0`; // pointerObj 对象。其key为设备id（唯一性），value为字符串、依次顺序为经度、纬度、时间、电池id、在线状态、推送数据标志
        if (key.onlineStatus === 1) {
          // onlineStatus 判断是否在线的标识。1 在线。0 离线；
          key.onLine = "在线";
          // if (!this.hasGet) {
          //   map.setCenter(new google.maps.LatLng(key.latitude, key.longitude));
          // } else {
          //   this.hasGet = true;
          // }
          if (key.batteryId) {
            sendData.param.push(key.deviceId);
            batteryIdArr[key.deviceId] = key.batteryId; // 制作电池id 字典。以设备id作为key，电池id作为value。
          }
        } else {
          key.onLine = "离线";
        }
        this.pointerArr.push(key);
      });
      this.sockets(JSON.stringify(sendData));
      this.mapData = {
        data: pointerObj,
        ponterIndex: ponterIndex,
        type: ""
      };
      // this.GaoDeMap(pointerObj);
    },
    GaoDeMap(data, fromWs) {
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      let allmarkerArr = Object.values(data);
      let markerkeys = Object.keys(data);
      this.markerTime = [];
      for (let i = 0; i < allmarkerArr.length; i++) {
        var lngs = allmarkerArr[i].toString().split(",");
        if (lngs[0].length > 6 && lngs[1].length > 6 && lngs[4] === "1") {
          let obj = {};
          var latLng = new google.maps.LatLng(lngs[0], lngs[1]);
          var marker = new google.maps.Marker({
            position: latLng,
            label: `${i + 1}`,
            title: `电池编号：${lngs[3]}\n设备编号：${markerkeys[i]}`,
            map: map
          });
          if (fromWs === "fromClick") {
            marker.setLabel({
              text: `${ponterIndex}`
            });
          }
          obj.pointer = marker;
          obj.times = lngs[2];
          this.markerTime.push(obj);
          this.markers.push(marker);
        }
      }
      this.markerTime.forEach(key => {
        key.pointer.addListener("click", e => {
          var latLngData =
            e.latLng.lat().toFixed(6) + "," + e.latLng.lng().toFixed(6);
          this.$.ajax({
            type: "post",
            url:
              "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
              latLngData +
              "&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC8IXpNgfA7uD-Xb0jEqhkEdB7j3gbgOiE",
            async: true,
            success: function(data) {
              let address;
              if (data.status === "OK") {
                address = data.results[0].formatted_address;
              } else {
                address = "地址获取失败";
              }
              var site =
                "时间：" +
                key.times +
                "<br />" +
                "坐标：" +
                latLngData +
                "<br />" +
                "地址：" +
                address;
              this.infowindow = new google.maps.InfoWindow({
                content: site
              });
              this.infowindow.open(map, key.pointer); // 弹出信息提示窗口
              map.addListener("click", () => {
                this.infowindow.close();
              });
            }
          });
        });
      });
      // 只有从概览中获取marker点的时候 才需要自适应显示；
      if (!fromWs) {
        // 地图自适应显示所有点
        let bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.markers.length; i++) {
          bounds.extend(this.markers[i].getPosition());
        }
        map.fitBounds(bounds);
      }
    },
    /*
    * @params deviceId 电池列表 获取的设备id。
    * @params index 为列表的索引。这里取这个索引是为了让地图的mark点 显示点的是第几个。
     */
    checkItem(item, index) {
      if (item.onlineStatus === 0) return;
      // map.setCenter(new AMap.LngLat(item.longitude, item.latitude));
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
        this.mapData = {
          data: selectObj,
          ponterIndex: ponterIndex,
          type: "fromClick"
        };
        // this.GaoDeMap(selectObj, "fromClick");
      }
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
        vm.bindingStatus = "";
      }
      if (from.name === "batteryList" && vm.pathParams) {
        vm.titles = "电池列表";
        vm.deviceShow = false;
        vm.bindingStatus = 1;
      }
    });
  },
  mounted() {
    this.pathParams = this.$route.query.deviceId;
    this.init();
  },
  beforeDestroy() {
    if (typeof this.over === "function") {
      this.over();
    }
  }
};
</script>
