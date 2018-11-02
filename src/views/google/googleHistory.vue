<template>
  <div class="all">
    <!-- <div class="mask"></div> -->
    <div class="control">
      <input :value="starts" type="text" @click="openStartPicker" readonly>~
      <input :value="endtime" type="text" @click="openEndPicker" readonly>
      <mt-datetime-picker ref="starts" :cancelText="$t('timeBtn.cancle')" :confirmText="$t('timeBtn.sure')" type="datetime" @confirm="StarttimeConfirm" v-model="startpickerValue">
      </mt-datetime-picker>
      <mt-datetime-picker ref="endtime" :cancelText="$t('timeBtn.cancle')" :confirmText="$t('timeBtn.sure')" type="datetime" @confirm="endTimeConfirm" v-model="endpickerValue">
      </mt-datetime-picker>
      <mt-button v-show="trajectory" size="small" type="danger" @click="heatmap">{{$t('history.heatActive')}}</mt-button>
      <mt-button v-show="!trajectory" size="small" type="primary" @click="track">{{$t('history.TrackReplay')}}</mt-button>
    </div>
    <div class="btns" v-show="trajectory">
      <div class="btnInfo">
        <mt-button :class="{'active': actived}" size="small" type="default" @click="startMove">
          <i class="iconfont icon-ic_song_next"></i>
        </mt-button>
        <!-- <mt-button :class="{'active': actived === 'pause'}" size="small" type="default" @click="pauseOnclick">
          <i class="iconfont icon-artboard25copy"></i>
        </mt-button>
        <mt-button :class="{'active': actived === 'resume'}" size="small" type="default" @click="resumeOnclick">
          <i class="iconfont icon-icons-resume_button"></i>
        </mt-button>
        <mt-button :class="{'active': actived === 'stop'}" size="small" type="default" @click="stopOnclick">
          <i class="iconfont icon-stop"></i>
        </mt-button> -->
      </div>
      <div class="ranges">
        <span>{{timeSeconds}}s</span>
        <mt-range :min="1" :max="100" v-model="timeSeconds" @change="speedChange"></mt-range>
      </div>
    </div>

    <div id="mapcontainer" class="mapcontainer"></div>
    <div class="batteryList" :class="[closed? 'closed': '']">
      <p @click="toggleList" class="controlBtn">
        <i :class="{'roted': !closed}"></i>
      </p>
      <ul>
        <li v-for="(item, index) in pointerArr" :class="[ devicelabel == item.deviceId ? 'selected': '', devicelabel == item.batteryId ? 'selected': '' ]" :key="item.deviceId" @click="checkItem(item, index)">
          <p>{{index+1}}、{{item.batteryId}}</p>
        </li>
        <!-- <li class="pages">
          <div @click="previous" :class="[previousBtn?'':'disable']">{{$t('pageBtn.previous')}}</div>
          <div @click="next" :class="[naxtBtn ? '': 'disable' ]">{{$t('pageBtn.next')}}</div>
        </li> -->
      </ul>
      <div class="pages">
        <div @click="previous" :class="[previousBtn?'':'disable']">{{$t('pageBtn.previous')}}</div>
        <div @click="next" :class="[naxtBtn ? '': 'disable' ]">{{$t('pageBtn.next')}}</div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import AMapUI from "AMapUI";
import { Indicator, Range, DatetimePicker } from "mint-ui";
import { GetTrajectory, GetDeviceList } from "@/api/index";
import {
  timeFormatSort,
  trakTimeformat,
  yesTody,
  timeFormats
} from "@/utils/transition";
import { onWarn, onTimeOut, onError } from "@/utils/callback";
import jquery from "jquery";

var map;
let heatmapData;
let line;
let animate1;
let pointArr = [];
export default {
  components: {
    "mt-range": Range,
    "mt-datetime-picker": DatetimePicker
  },
  data() {
    return {
      actived: false,
      naxtBtn: true,
      previousBtn: false,
      trajectory: false,
      active: true,
      navg: null,
      time: "",
      map: null,
      devicelabel: "",
      showList: false,
      starts: yesTody(),
      endtime: timeFormats(new Date()),
      startpickerValue: yesTody(),
      endpickerValue: timeFormats(new Date()),
      chooseTime: [],
      pointerArr: [],
      closed: true,
      toggleTip: this.$t("toggleTip.open"),
      gridData: [],
      markerArr: [],
      alldistance: 0,
      timeSeconds: 50,
      pageNum: 1,
      total: 10,
      localMakerArr: [],
      markerPointer: {
        sdPointer: [],
        mapPointer: []
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      try {
        map = new google.maps.Map(document.getElementById("mapcontainer"), {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 15
        });
        this.getHisData();
        // map.addListener("click", e => {
        //   if (this.localMakerArr.length > 0) {
        //     this.localMakerArr.forEach(key => {
        //       key.setMap(null);
        //     });
        //   }
        //   var latLngData =
        //     e.latLng.lat().toFixed(6) + "," + e.latLng.lng().toFixed(6);
        //   var localMaker = new google.maps.Marker({
        //     position: e.latLng,
        //     icon: {
        //       path: google.maps.SymbolPath.CIRCLE,
        //       scale: 3,
        //       strokeColor: "red"
        //     },
        //     map: map
        //   });
        //   this.localMakerArr.push(localMaker);
        //   // jquery.ajax({
        //   //   type: "post",
        //   //   url:
        //   //     "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        //   //     latLngData +
        //   //     "&key=AIzaSyC8IXpNgfA7uD-Xb0jEqhkEdB7j3gbgOiE&fields=formatted_address",
        //   //   async: true,
        //   //   success: function(data) {
        //   //     console.log(data);
        //   //     let site = `${this.$t(
        //   //       "history.latLng"
        //   //     )}：${latLngData}<br />${this.$t("history.address")}：${
        //   //       data.results[0].formatted_address
        //   //     }`;
        //   //     let infowindow = new google.maps.InfoWindow({
        //   //       content: site
        //   //     });
        //   //     infowindow.open(map, localMaker); // 弹出信息提示窗口
        //   //     map.addListener("click", () => {
        //   //       infowindow.close();
        //   //     });
        //   //   }
        //   // });
        // });
      } catch (err) {
        onError(`${this.$t("mapError")}`);
      }
    },
    // 获取列表数据
    getHisData() {
      let pageObj = {
        bindingStatus: "1",
        pageNum: this.pageNum,
        pageSize: 10
      };
      Indicator.open();
      GetDeviceList(pageObj).then(res => {
        console.log(res);
        if (res.data && res.data.code === 0) {
          Indicator.close();
          let result = res.data.data.data;
          this.total = res.data.data.totalPage;
          this.batteryId = this.$route.query.batteryId;
          this.pointerArr = [];
          if (result.length > 0) {
            this.naxtBtn = this.pageNum < this.total ? true : false;
            this.previousBtn = this.pageNum === 1 ? false : true;
            result.forEach(key => {
              if (key.batteryId) {
                if (this.batteryId && this.batteryId === key.batteryId) {
                  this.queryDevice = key.deviceId; // 根据路由参数中的电池id 获取对应的设备id；
                }
                this.pointerArr.push(key);
              }
            });
            let params = {
              pushDateStart: timeFormatSort(this.starts),
              pushDateEnd: timeFormatSort(this.endtime)
            };
            if (this.batteryId && this.pageNum === 1) {
              this.devicelabel = this.batteryId;
              params.batteryId = this.batteryId;
              this.getData(params);
            } else {
              this.devicelabel = result[0].batteryId;
              params.batteryId = result[0].batteryId;
              this.queryDevice = result[0].deviceId;
              this.getData(params);
            }
            // this.getTimeList(this.queryDevice);
          } else {
            onWarn(`${this.$t('positions.noDevice')}`);
          }
        }
      });
    },
    // 上一页
    previous() {
      if (this.pageNum > 1) {
        // Indicator.open();
        this.pageNum = this.pageNum - 1;
        // this.markers && map.remove(this.markers);
        this.getHisData();
      }
    },
    // 下一页
    next() {
      if (this.pageNum < this.total) {
        // Indicator.open();
        // this.markers && map.remove(this.markers);
        this.pageNum = this.pageNum + 1;
        this.getHisData();
      }
    },
    // 选择开始时间
    openStartPicker() {
      this.$refs.starts.open();
    },
    // 选择结束时间
    openEndPicker() {
      this.$refs.endtime.open();
    },
    // 确认开始时间
    StarttimeConfirm(value) {
      console.log(value);
      this.starts = timeFormats(value);
      this.selectedDate();
    },
    // 确认结束时间
    endTimeConfirm(value) {
      this.endtime = timeFormats(value);
      this.selectedDate();
    },
    // 打开&&关闭列表
    toggleList() {
      this.closed = !this.closed;
      this.toggleTip = this.closed
        ? this.$t("toggleTip.open")
        : this.$t("toggleTip.close");
    },
    speedChange() {
      console.log("change", this.timeSeconds);
      if (this.timeSeconds < 1) {
        this.timeSeconds = 1;
      }
      if (this.alldistance) {
        let distance = Number(this.alldistance) / 1000;
        let times = Number(this.timeSeconds) / 3600;
        let speeds = Math.ceil(distance / times);
        navg.setSpeed(speeds);
      }
    },
    /* 时间确认按钮 */
    selectedDate() {
      if (!this.startpickerValue) {
        onWarn(`${this.$t("history.startTime")}`);
        return;
      }
      if (!this.endpickerValue) {
        onWarn(`${this.$t("history.endTime")}`);
        return;
      }
      if (new Date(this.startpickerValue) > new Date(this.endpickerValue)) {
        onWarn(`${this.$t("history.checkErr")}`);
        return;
      }
      let opts = {
        pushDateStart: timeFormatSort(this.startpickerValue),
        pushDateEnd: timeFormatSort(this.endpickerValue)
      };
      opts.batteryId = this.devicelabel;
      this.starts = timeFormats(this.startpickerValue);
      this.endtime = timeFormats(this.endpickerValue);
      Indicator.open();
      this.getData(opts);
      // if (this.deviceId && this.pageNum === 1) {
      //   opts.deviceId = this.devicelabel;
      //   this.getData(opts);
      // } else {
      //   opts.batteryId = this.devicelabel;
      //   this.getData(opts);
      // }
    },
    /* 时间确认按钮 */
    selectedDate(date) {
      if (!this.starts) {
        onWarn(`${this.$t("history.startTime")}`);
        return;
      }
      if (!this.endtime) {
        onWarn(`${this.$t("history.endTime")}`);
        return;
      }
      if (Number(this.starts) > Number(this.endtime)) {
        onWarn(`${this.$t("history.checkErr")}`);
        return;
      }
      let opts = {
        pushDateStart: timeFormatSort(this.starts),
        pushDateEnd: timeFormatSort(this.endtime)
      };
      opts.batteryId = this.devicelabel;
      // this.getTimeList(this.queryDevice);
      this.clearMap();
      this.getData(opts);
    },
    /* 获取数据 */
    getData(params) {
      Indicator.open();
      GetTrajectory(params).then(res => {
        Indicator.close();

        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          // console.log(result);
          this.lineArr = [];
          if (result.length > 0) {
            this.gridData = [];
            for (let i = 0; i < result.length; i++) {
              var key = result[i];
              var obj = {};
              obj.pushTime = key.pushTime;
              obj.ponter = new google.maps.LatLng(key.latitude, key.longitude);
              this.lineArr.push(obj);
              this.gridData.push(
                new google.maps.LatLng(key.latitude, key.longitude)
              );
            }
            map.setCenter(this.gridData[0]);
            if (this.active) {
              this.heatmap();
            } else {
              this.track();
            }
          } else {
            onWarn(`${this.$t("history.noData")}`);
          }
        }
      });
    },
    heatmap() {
      this.trajectory = false;
      this.active = true;
      this.clearMap();
      heatmapData = new google.maps.visualization.HeatmapLayer({
        data: this.gridData,
        map: map,
        radius: 10,
        opacity: 1,
        maxIntensity: 15,
        dissipating: true,
        gradient: [
          "rgba(0, 0, 255, 0)",
          "rgba(55, 55, 255, 1)",
          "rgba(0, 255, 120, 1)",
          "rgba(18, 255, 0, 1)",
          "rgba(150, 255, 0, 1)",
          "rgba(210, 255, 0, 1)",
          "rgba(255, 228, 0, 1)",
          "rgba(255, 216, 0, 1)",
          "rgba(255, 132, 0, 1)",
          "rgba(255, 72, 0, 1)",
          "rgba(255, 48, 0, 1)",
          "rgba(234, 86, 61, 1)",
          "rgba(255, 36, 0, 1)",
          "rgba(255, 0, 0, 1)"
        ]
      });
      // heatmapData.set("gradient", gradient);
    },

    startMove() {
      this.actived = true;
      this.animateCircle(this.timeSeconds);
    },
    animateCircle(times) {
      let seconds = times || 10;
      var count = 0;
      animate1 && clearInterval(animate1);
      animate1 = window.setInterval(() => {
        count = count + 5;
        // console.log(count)
        var icons = line.get("icons");
        icons[0].offset = (count / this.gridData.length) * 100 + "%";
        line.set("icons", icons);
        console.log(count, icons[0].offset);
        // // //终点停车
        if (count >= this.gridData.length) {
          clearInterval(animate1);
        }
      }, seconds);
    },
    // 历史轨迹 轨迹配置
    track() {
      this.trajectory = true;
      this.active = false;
      this.actived = false;
      this.clearMap();
      line = new google.maps.Polyline({
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: "#1200ff"
            },
            offset: "0%"
          }
        ],
        strokeColor: "#71253e",
        map: map
      });
      line.setPath(this.gridData);
      let TimerMax = Math.ceil(this.gridData.length * 0.01);
      if (TimerMax > this.max) {
        this.max = Math.ceil(TimerMax * 2);
      }
      this.min = TimerMax;
      this.timeSeconds = TimerMax;
      let start = new google.maps.Marker({
        position: this.gridData[0],
        label: {
          color: "#FFF",
          text: "S"
        },
        map: map
      });
      let end = new google.maps.Marker({
        position: this.gridData[this.gridData.length - 1],
        label: {
          color: "#FFF",
          text: "E"
        },
        map: map
      });
      this.markerPointer.sdPointer.push(start);
      this.markerPointer.sdPointer.push(end);
    },
    // 清除地图上的覆盖物
    clearMap() {
      animate1 && clearInterval(animate1);
      heatmapData && heatmapData.setMap(null);
      line && line.setMap(null);
      if (this.markerPointer.sdPointer.length > 0) {
        this.markerPointer.sdPointer.forEach(marker => {
          marker.setMap(null);
        });
        this.markerPointer.sdPointer = [];
      }
      if (this.markerPointer.mapPointer.length > 0) {
        this.markerPointer.mapPointer.forEach(marker => {
          marker.setMap(null);
        });
        this.markerPointer.mapPointer = [];
      }
      if (this.localMakerArr.length > 0) {
        this.localMakerArr.forEach(key => {
          key.setMap(null);
        });
      }
    },
    // 列表点击事件
    checkItem(item) {
      this.activePointer = [];
      this.blockArr = [];
      animate1 && clearInterval(animate1);
      this.clearMap();
      let params = {
        pushDateStart: timeFormatSort(this.starts),
        pushDateEnd: timeFormatSort(this.endtime)
      };
      params.batteryId = item.batteryId;
      this.devicelabel = item.batteryId;
      this.queryDevice = item.deviceId;
      this.getData(params);
      // this.getTimeList(this.queryDevice);
    }
  },
  beforeDestroy() {
    animate1 && clearInterval(animate1);
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.all {
  position: absolute;
  top: $baseHeader;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  .mask {
    position: absolute;
    top: $baseHeader;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 88;
  }
  .mapcontainer {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .control {
    position: absolute;
    left: 0;
    top: 0px;
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding: 0 5px;
    font-size: px2rem(14px);
    border-bottom: 1px solid #f0f0f0;
    z-index: 10;
    background: #ffffff;
    color: #333;
    // z-index: 999;
    input {
      font-size: px2rem(13px);
      width: 35%;
      color: #333;
      text-align: center;
    }
  }
  .btns {
    position: absolute;
    top: 54px;
    padding-top: 40px;
    width: 100%;
    left: 0;
    z-index: 20;
    font-size: 0;
    display: flex;
    padding: 0 15px;
    .btnInfo {
      flex: 1;
      font-size: 0;
      button {
        margin-top: 8px;
        margin-right: 3px;
        box-shadow: 0px 0px 10px #333333;
        &.active {
          background: #fff;
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
    .ranges {
      background: #f0f0f0;
      text-align: center;
      font-size: px2rem(14px);
      width: 43%;
      margin-right: px2rem(14px);
    }
  }
  .batteryList {
    position: absolute;
    top: 53px;
    right: 0;
    width: px2rem(150px);
    z-index: 99;
    background: #fafafa;
    padding: px2rem(6px) px2rem(4px);
    height: auto;
    line-height: px2rem(24px);
    transition: all 0.3s ease-in;
    z-index: 111;
    &.closed {
      right: px2rem(-150px);
    }
    .controlBtn {
      width: 26px;
      position: absolute;
      top: 0;
      height: 26px;
      left: -27px;
      background-color: #fff;
      padding: 4px;
      border-radius: 2px;
      border: 1px solid #e5e5e5;

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
      height: 350px;
      overflow: auto;
      li {
        font-size: px2rem(12px);
        padding: px2rem(6px) px2rem(5px);
        position: relative;
        border-bottom: px2rem(1px) solid #f5f5f5;
        &.selected {
          background: #98dbff;
          color: #fff;
        }
      }
    }
    .pages {
      display: flex;
      font-size: px2rem(12px);
      div {
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
