<template>
  <div id="outer-box">
    <div id="positions" class="positioned"></div>
    <!-- <gaode-map v-if="GETMAPTYPE == 0" :propData="mapData"></gaode-map>
    <google-map v-if="GETMAPTYPE == 1" :propData="mapData"></google-map> -->
    <div class="batteryList" :class="[GETrealList? 'closed': '']">
      <mt-button @click="showAllPionter" type="primary" size="small">{{$t('positions.lookAll')}}</mt-button>
      <p @click="toggleList" class="controlBtn">
        <i :class="{'roted': !GETrealList}"></i>
      </p>
      <ul>
        <li v-for="(item, index) in pointerArr" :class="[ devicelabel == item.deviceId ? 'selected': '', devicelabel == item.batteryId ? 'selected': '' ]" :key="item.deviceId" @click="checkItem(item, index)">
          <p>{{index + 1}}、{{deviceShow? item.deviceId : item.batteryId}}</p>
          <div class="badges">
            <span @click.prevent.stop="HistoryTrack(item.batteryId)" class="hisBad">{{$t('positions.track')}}</span>
            <span class="onlines" :class="[item.onlineStatus === 0 ?'off': '']">
              <!-- <i>{{item.onLine}}</i> -->
              <i></i>
            </span>
          </div>
        </li>
      </ul>
      <div class="pages">
        <div @click="previous" :class="[previousBtn?'':'disable']">{{$t('pageBtn.previous')}}</div>
        <div @click="next" :class="[naxtBtn ? '': 'disable' ]">{{$t('pageBtn.next')}}</div>
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
      margin-bottom: 5px;
    }
    .controlBtn {
      width: 26px;
      position: absolute;
      top: 0;
      height: 36px;
      padding: 10px 4px;
      left: -27px;
      background-color: #fff;
      // padding: 4px;
      border-radius: 4px;
      border: 1px solid #b3d8ff;
      i {
        width: 100%;
        height: 100%;
        display: block;
        background: url("../../assets/open.png") no-repeat;
        background-size: 16px;
        &.roted {
          transform: rotate(180deg);
        }
      }
    }
    ul {
      width: 100%;
      background: #ffffff;
      height: 350px;
      overflow: scroll;
      li {
        font-size: px2rem(12px);
        padding: px2rem(6px) px2rem(5px);
        position: relative;
        border-bottom: px2rem(1px) solid #f5f5f5;
        &.selected {
          background: #c7ebff;
          color: #fff;
          .onlines {
            color: #ffffff !important;
          }
        }
        .badges {
          padding-left: 15px;
          position: relative;
          text-align: right;
          .hisBad {
            border: 1px solid #f0f0f0;
            border-radius: 5px;
            padding: 4px;
            background: #98dbff;
            color: #ffffff;
          }
          .onlines {
            position: absolute;
            top: -6px;
            right: -4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #cccccc;
            background: #67c23a;
            &.off {
              background: #f0f0f0;
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
import { mapGetters } from 'vuex';
// import jquery from "jquery";
import google from "google";
import { Indicator } from "mint-ui";
import { websockets, GetDeviceList } from "@/api/index";
import {
  timeFormats,
  trakTimeformat,
  nowDate,
  setStorage
} from "@/utils/transition";
import { onError } from "@/utils/callback";

// import googleMap from "./googleMap";
// import gaodeMap from "./gaodeMap";

let map;
let infoWindow;
let batteryIdArr = {};
export default {
  // components: {
  //   googleMap,
  //   gaodeMap
  // },
  data () {
    return {
      pointerObj: {},
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
      // toggleTip: "展开",
      showList: false,
      GETMAPTYPE: "",
      pathParams: "" // url 中设备id 参数
    };
  },
  computed: {
    ...mapGetters(['GETrealList'])
  },
  methods: {
    init () {
      map = new google.maps.Map(document.getElementById("positions"), {
        center: {
          lat: 0,
          lng: 0
        },
        zoom: 10
      });
      this.getListData();
    },
    next () {
      if (this.pageNum < this.total) {
        this.over();
        this.pageNum = this.pageNum + 1;
        this.getListData();
      }
    },
    previous () {
      if (this.pageNum > 1) {
        this.pageNum = this.pageNum - 1;
        this.over();
        this.getListData();
      }
    },
    // 打开&&关闭列表
    toggleList () {
      // this.closed = !this.closed;
      this.$store.commit('setRealList', !this.GETrealList);
      // this.toggleTip = this.closed ? "展开" : "收起";
    },
    // 查看所有点
    showAllPionter () {
      this.devicelabel = null;
      this.deviceId = null;
      this.GaoDeMap(this.pointerObj, "fromWs");
    },
    pageChange () {
      this.over();
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      this.getListData();
    },

    getListData () {
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
      Indicator.open();
      GetDeviceList(pageObj).then(res => {
        console.log(res.data);
        Indicator.close();
        if (res.data && res.data.code === 0) {
          this.pointerArr = [];
          let center = res.data.data;
          let result = center.data;
          this.total = center.totalPage;
          let sendData = { api: "bind", param: [] };
          this.pointerObj = {};
          if (result.length > 0) {
            this.naxtBtn = this.pageNum < this.total ? true : false;
            this.previousBtn = this.pageNum === 1 ? false : true;
            if (this.pathParams) {
              result.forEach((key, index) => {
                if (Math.abs(Number(key.longitude)) > 1 && Math.abs(Number(key.latitude)) > 1) {
                  this.pointerObj[key.deviceId] = `${key.longitude},${key.latitude},${trakTimeformat(key.pushTime)},${key.batteryId},${key.onlineStatus},0,${index + 1},${key.voltage}`;
                  // pointerObj 对象。其key为设备id（唯一性），value为字符串、依次顺序为经度、纬度、时间、电池id、在线状态
                }
                key.onLine = key.onlineStatus === 1 ? this.$t("positions.onLine") : this.$t("positions.offline");
                if (key.batteryId) {
                  batteryIdArr[key.deviceId] = key.batteryId; // 制作电池id 字典。以设备id作为key，电池id作为value。
                }
                if (key.deviceId) {
                  sendData.param.push(key.deviceId);
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
            onError(`${this.$t("positions.noDevice")}`);
          }
        }
      });
    },
    // websockets 请求
    sockets (data) {
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
            if (this.pointerArr.length > 0) {
              this.pointerArr.forEach(key => {
                if (key.deviceId === obj[0]) {
                  key.onlineStatus = 1;
                  let ponterIndexs = this.pointerObj[obj[0]];
                  let index = ponterIndexs.split(',');
                  if (Math.abs(Number(obj[2])) > 1 && Math.abs(Number(obj[1])) > 1) {
                    this.pointerObj[obj[0]] = `${obj[2]},${obj[1]},${nowDate()},${key.batteryId},1,1,${index[6]},${obj[3]}`;
                    // pointerObj 对象。其key为设备id（唯一性），value为字符串、
                    // 依次顺序为 经度、纬度、时间、电池id、在线状态、推送数据标志, 电压
                  }
                  return false;
                }
              })
            }

            if (this.deviceId || this.pathParams) {
              let keys = Object.keys(this.pointerObj);
              let nextObj = {};
              keys.forEach((item, index) => {
                if (item === this.deviceId || item === this.pathParams) {
                  nextObj[item] = this.pointerObj[item];
                }
              });
              this.GaoDeMap(nextObj, "fromClick");
            } else {
              this.GaoDeMap(this.pointerObj, "fromWs");
            }
          }
        };
        ws.onerror = () => {
          console.log("onerror...");
          onError(this.$t("internetErr"));
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
    mapInit (data) {
      this.pointerObj = {};
      let sendData = { api: "bind", param: [] };
      console.log(data);
      data.forEach((key, index) => {
        // onlineStatus 判断是否在线的标识。1 在线。0 离线；
        key.onLine = key.onlineStatus === 1 ? this.$t("positions.onLine") : this.$t("positions.offline");
        if (key.batteryId) {
          sendData.param.push(key.deviceId);
          batteryIdArr[key.deviceId] = key.batteryId; // 制作电池id 字典。以设备id作为key，电池id作为value。
        }
        if (Math.abs(Number(key.longitude)) > 1 && Math.abs(Number(key.latitude)) > 1) {
          this.pointerObj[key.deviceId] = `${key.longitude},${key.latitude},${trakTimeformat(key.pushTime)},${key.batteryId},${key.onlineStatus},0,${index + 1},${key.voltage}`;
        }
        this.pointerArr.push(key);

      });
      this.sockets(JSON.stringify(sendData));
      this.GaoDeMap(this.pointerObj);
    },
    /*
    * @params deviceId 电池列表 获取的设备id。
    * @params index 为列表的索引。这里取这个索引是为了让地图的mark点 显示点的是第几个。
     */
    checkItem (item, index) {
      if (!item.longitude || !item.latitude) return;
      // map.setCenter(new AMap.LngLat(item.longitude, item.latitude));
      this.devicelabel = item.deviceId;
      this.deviceId = item.deviceId;
      this.showTip = item.batteryId;
      this.toggleList();
      infoWindow && infoWindow.close(); // infoWindow 高德地图 数据展示框。
      if (this.deviceId && this.pointerObj) {
        let keys = Object.keys(this.pointerObj);
        let selectObj = {};
        keys.forEach(items => {
          if (items === this.deviceId) {
            selectObj[this.deviceId] = `${this.pointerObj[items]},${index + 1}`;
          }
        });
        this.GaoDeMap(selectObj, "fromClick");
      }
    },
    GaoDeMap (data, type) {
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      // let data = value.data;
      console.log();
      let allmarkerArr = Object.values(data);
      let markerkeys = Object.keys(data);
      this.markerTime = [];
      for (let i = 0; i < allmarkerArr.length; i++) {
        var lngs = allmarkerArr[i].toString().split(",");
        if (lngs[0] && lngs[1]) {
          let obj = {};
          var latLng = new google.maps.LatLng(lngs[1], lngs[0]);
          var marker = new google.maps.Marker({
            position: latLng,
            label: `${i + 1}`,
            title: `${this.$t("positions.batteryCode")}：${lngs[3]}\n${this.$t(
              "positions.deviceCode"
            )}：${markerkeys[i]}`,
            map: map
          });
          // map.setCenter(latLng);
          if (type === "fromClick") {
            map.setCenter(latLng);
            marker.setLabel({
              text: `${lngs[6]}`
            });
          }
          obj.pointer = marker;
          obj.datas = lngs;
          obj.deviceCode = markerkeys[i];
          this.markerTime.push(obj);
          this.markers.push(marker);
        }
      }
      this.markerTime.forEach(key => {
        const self = this;
        // console.log(key);
        key.pointer.addListener("click", e => {
          let latLngData =
            e.latLng.lat().toFixed(6) + "," + e.latLng.lng().toFixed(6);
          let site;
          if (key.datas[7] === "null") {
            site = `${self.$t("positions.batteryCode")}：${
              key.datas[3]
              }<br />${self.$t("positions.deviceCode")}：${
              key.deviceCode
              }<br />${self.$t("positions.updateTime")}：${
              key.datas[2]
              }<br />${self.$t("positions.latLng")}：${latLngData}`;
          } else {
            site = `${self.$t("positions.voltage")}: ${
              key.datas[7]
              }<br />${self.$t("positions.batteryCode")}：${
              key.datas[3]
              }<br />${self.$t("positions.deviceCode")}：${
              key.deviceCode
              }<br />${self.$t("positions.updateTime")}：${
              key.datas[2]
              }<br />${self.$t("positions.latLng")}：${latLngData}`;
          }

          this.infowindow = new google.maps.InfoWindow({
            content: site
          });
          this.infowindow.open(map, key.pointer); // 弹出信息提示窗口
          map.addListener("click", () => {
            this.infowindow.close();
          });
          // jquery.ajax({
          //   type: "post",
          //   url:
          //     "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
          //     latLngData +
          //     "&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC8IXpNgfA7uD-Xb0jEqhkEdB7j3gbgOiE",
          //   async: true,
          //   success: function(data) {
          //     let address;
          //     if (data.status === "OK") {
          //       address = data.results[0].formatted_address;
          //     } else {
          //       address = self.$t("positions.getAdressErr");
          //     }
          //     // let site = `${self.$t("positions.batteryCode")}：${
          //     //   key.datas[3]
          //     // }<br />${self.$t("positions.deviceCode")}：${
          //     //   key.deviceCode
          //     // }<br />${self.$t("positions.updateTime")}：${
          //     //   key.datas[2]
          //     // }<br />${self.$t(
          //     //   "positions.latLng"
          //     // )}：${latLngData}<br />${self.$t(
          //     //   "positions.address"
          //     // )}：${address}`;
          //     // this.infowindow = new google.maps.InfoWindow({
          //     //   content: site
          //     // });
          //     // this.infowindow.open(map, key.pointer); // 弹出信息提示窗口
          //     // map.addListener("click", () => {
          //     //   this.infowindow.close();
          //     // });
          //   }
          // });
        });
      });
      // 只有从概览中获取marker点的时候 才需要自适应显示；
      if (!type) {
        // 地图自适应显示所有点
        let bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < this.markers.length; i++) {
          bounds.extend(this.markers[i].getPosition());
        }
        map.fitBounds(bounds);
      }
    },
    // 查看历史轨迹。路由传参 设备id
    HistoryTrack (batteryId) {
      const loginData = JSON.parse(localStorage.getItem("loginData"));
      if (loginData && loginData.mapType === 1) {
        this.$router.push({
          path: "goghistory",
          query: { batteryId: batteryId }
        });
      } else {
        this.$router.push({
          path: "history",
          query: { batteryId: batteryId }
        });
      }

      let titles = `${this.$t("menu.history")}`;
      this.$store.commit('SetProjectName', titles);
      this.$store.commit('setCollapse', false);
    }
  },
  /*
  * 用beforeRouteEnter 这个路由钩子函数 来判断是从哪个路由跳转过来的
  * 以此来处理列表显示内容
  */
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.name === "device" && vm.pathParams) {
        vm.titles = `${this.$t("positions.title1")}`;
        vm.deviceShow = true;
        vm.bindingStatus = "";
      }
      if (from.name === "batteryList" && vm.pathParams) {
        vm.titles = `${this.$t("positions.title2")}`;
        vm.deviceShow = false;
        vm.bindingStatus = 1;
      }
    });
  },
  mounted () {
    this.GETMAPTYPE = localStorage.getItem("mapType");
    this.pathParams = this.$route.query.deviceId;
    this.init();
  },
  beforeDestroy () {
    if (typeof this.over === "function") {
      this.over();
    }
  }
};
</script>
