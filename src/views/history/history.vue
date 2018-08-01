<template>
  <div class="all">
    <!-- <div class="mask"></div> -->
    <div class="control">
      <input :value="starts" type="text" @click="openStartPicker" readonly placeholder="开始时间">~
      <input :value="endtime" type="text" @click="openEndPicker" readonly placeholder="结束时间">
      <mt-datetime-picker ref="starts" type="datetime" @confirm="StarttimeConfirm" v-model="startpickerValue">
      </mt-datetime-picker>
      <mt-datetime-picker ref="endtime" type="datetime" @confirm="endTimeConfirm" v-model="endpickerValue">
      </mt-datetime-picker>
      <mt-button v-show="trajectory" size="small" type="danger" @click="heatmap">活动热区</mt-button>
      <mt-button v-show="active" size="small" type="primary" @click="track">轨迹回放</mt-button>
    </div>
    <div class="btns" v-show="trajectory">
      <div class="btnInfo">
        <mt-button :class="{'active': actived === 'start'}" size="small" type="default" @click="startOnclick">
          <i class="iconfont icon-ic_song_next"></i>
        </mt-button>
        <mt-button :class="{'active': actived === 'pause'}" size="small" type="default" @click="pauseOnclick">
          <i class="iconfont icon-artboard25copy"></i>
        </mt-button>
        <mt-button :class="{'active': actived === 'resume'}" size="small" type="default" @click="resumeOnclick">
          <i class="iconfont icon-icons-resume_button"></i>
        </mt-button>
        <mt-button :class="{'active': actived === 'stop'}" size="small" type="default" @click="stopOnclick">
          <i class="iconfont icon-stop"></i>
        </mt-button>
      </div>
      <div class="ranges">
        <span>{{timeSeconds}}s</span>
        <mt-range :min="1" :max="100" v-model="timeSeconds" @change="speedChange"></mt-range>
      </div>
    </div>
    <div class="mapcontainer" id="mapcontainer"></div>
    <div class="batteryList" :class="[closed? 'closed': '']">
      <p @click="toggleList" class="controlBtn">{{toggleTip}}</p>
      <ul>
        <li v-for="(item, index) in pointerArr" :class="[ devicelabel == item.deviceId ? 'selected': '', devicelabel == item.batteryId ? 'selected': '' ]" :key="item.deviceId" @click="checkItem(item, index)">
          <p>{{index+1}}、{{item.batteryId}}</p>
        </li>
        <li class="pages">
          <div @click="previous" :class="[previousBtn?'':'disable']">上一页</div>
          <div @click="next" :class="[naxtBtn ? '': 'disable' ]">下一页</div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import AMapUI from "AMapUI";
import { Indicator, Range, DatetimePicker } from "mint-ui";
import { GetTrajectory, GetDeviceList } from "../../api/index";
import {
  timeFormatSort,
  trakTimeformat,
  yesTody,
  timeFormats
} from "../../utils/transition";
import { onWarn, onTimeOut, onError } from "../../utils/callback";

let map;
let navg;
let heatmap;
let pathSimplifierIns;
let infoWindow;
export default {
  components: {
    "mt-range": Range,
    "mt-datetime-picker": DatetimePicker
  },
  data() {
    return {
      actived: '',
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
      toggleTip: "展开",
      gridData: [],
      markerArr: [],
      alldistance: 0,
      timeSeconds: 50,
      pageNum: 1,
      total: 10
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 上一页
    previous() {
      if (this.pageNum > 1) {
        Indicator.open();
        this.pageNum = this.pageNum - 1;
        // this.markers && map.remove(this.markers);
        this.getHisData();
      }
    },
    // 下一页
    next() {
      if (this.pageNum < this.total) {
        Indicator.open();
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
    StarttimeConfirm() {
      this.selectedDate();
    },
    // 确认结束时间
    endTimeConfirm() {
      this.selectedDate();
    },
    // 打开&&关闭列表
    toggleList() {
      this.closed = !this.closed;
      this.toggleTip = this.closed ? "展开" : "收起";
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
        onWarn("请选择开始时间");
        return;
      }
      if (!this.endpickerValue) {
        onWarn("请选择结束时间");
        return;
      }
      if (new Date(this.startpickerValue) > new Date(this.endpickerValue)) {
        onWarn("开始时间应小于结束时间");
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
    /* 获取数据 */
    getData(params) {
      GetTrajectory(params)
        .then(res => {
          // console.log(res);
          Indicator.close();
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
            let result = res.data.data;
            this.gridData = [];
            this.lineArr = [];
            this.alldistance = 0; // 运动的总距离（米）
            if (result.length > 0) {
              for (let i = 0; i < result.length; i++) {
                let key = result[i];
                var distance, p1, p2;
                if (i < result.length - 1) {
                  p1 = new AMap.LngLat(key.longitude, key.latitude);
                  p2 = new AMap.LngLat(
                    result[i + 1].longitude,
                    result[i + 1].latitude
                  );
                  distance = Math.round(p1.distance(p2));
                }
                this.alldistance += distance;
                let obj = {};
                obj.lng = key.longitude;
                obj.lat = key.latitude;
                obj.pushTime = key.pushTime;
                // obj.distance = key.distance;
                // obj.distance = distance;
                obj.count = 150;
                this.lineArr.push([obj.lng, obj.lat, obj.pushTime]);
                this.gridData.push(obj);
              }
              if (this.trajectory && pathSimplifierIns) {
                pathSimplifierIns.setData();
                this.track();
              }
              if (this.active) {
                this.heatmap();
              }
            } else {
              if (pathSimplifierIns) {
                pathSimplifierIns.setData();
                this.track();
              }
              onWarn("此设备当前时间段内，暂无数据");
              heatmap.hide();
            }
          }
          if (res.data.code === -1) {
            onError(res.data.msg);
          }
        })
        .catch(err => {
          console.log(err);
          onError("服务器请求超时，请稍后重试");
        });
    },
    heatmap() {
      if (this.markerArr.length > 0) {
        map.remove(this.markerArr);
      }
      this.trajectory = false;
      this.active = true;
      map.setCenter([this.gridData[0].lng, this.gridData[0].lat]);
      heatmap.setDataSet({
        data: this.gridData // 热力图数据
      });
      heatmap.show();
      pathSimplifierIns && pathSimplifierIns.hide();
    },
    init() {
      map = new AMap.Map("mapcontainer", {
        resizeEnable: true,
        // mapStyle: 'amap://styles/macaron',
        zoom: 15
      });
      AMap.plugin(["AMap.Heatmap"], () => {
        // 初始化heatmap对象
        heatmap = new AMap.Heatmap(map, {
          radius: 12, // 给定半径
          opacity: [0, 1] // 透明度
        });
      });
      Indicator.open();
      this.getHisData();
    },
    // 获取列表数据
    getHisData() {
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 10
      };
      GetDeviceList(pageObj)
        .then(res => {
          Indicator.close();
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
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
            this.pointerArr = [];
            if (result.length > 0) {
              result.forEach(key => {
                if (key.batteryId) {
                  this.pointerArr.push(key);
                }
              });
              // this.total = res.data.data.total;

              this.batteryId = this.$route.query.batteryId;
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
                this.getData(params);
              }
            } else {
              onWarn("暂无设备, 请先注册设备");
            }
          }
          if (res.data.code === -1) {
            onError(res.data.msg);
          }
        })
        .catch(() => {
          onError("服务器请求超时，请稍后重试");
        });
    },
    // 历史轨迹 轨迹配置
    track() {
      this.trajectory = true;
      this.active = false;
      heatmap && heatmap.hide();
      if (this.markerArr.length > 0) {
        map.remove(this.markerArr);
      }
      if (this.lineArr.length < 1) {
        return;
      }
      AMapUI.load(["ui/misc/PathSimplifier"], PathSimplifier => {
        if (!PathSimplifier.supportCanvas) {
          onError("当前环境不支持 Canvas！");
          return;
        }
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
          pathSimplifierIns = new PathSimplifier({
            zIndex: 100,
            map: map,
            getHoverTitle: function(pathData, pathIndex, pointIndex) {
              if (pointIndex >= 0) {
                return `第${pointIndex}个点`;
              }
            },
            getPath: pathData => {
              return pathData.path;
            },
            renderOptions: {
              pathLineStyle: {
                strokeStyle: "rgb(193,21,52)",
                lineWidth: 6,
                dirArrowStyle: true
              },
              keyPointTolerance: 10,
              keyPointStyle: {
                radius: 3,
                fillStyle: "#20acff"
              }
            }
          });
          pathSimplifierIns.on("pointClick", (e, infos) => {
            let pointIndex = infos.pointIndex;
            let pathData = infos.pathData;
            let point = pathData.path[pointIndex];
            let position = new AMap.LngLat(point[0], point[1]);
            positionPicker.start(position);
            positionPicker.on("success", result => {
              let info = [];
              info.push(
                `<div><div style="font-size:14px;">时间：${trakTimeformat(
                  point[2]
                )}</div>`
              );
              info.push(
                `<div style="font-size:14px;">路口 :${
                  result.nearestJunction
                }</div>`
              );
              info.push(
                `<div style="font-size:14px;">地址 :${
                  result.address
                }</div></div>`
              );
              infoWindow = new AMap.InfoWindow({
                content: info.join("") // 使用默认信息窗体框样式，显示信息内容
              });
              infoWindow.open(map, position);
              map.on("click", () => {
                infoWindow.close();
              });
            });
          });
          window.pathSimplifierIns = pathSimplifierIns;
          pathSimplifierIns.setData([
            {
              name: "轨迹",
              path: this.lineArr
            }
          ]);
          let distance = Number(this.alldistance) / 1000; // 米转成千米
          let times = Number(this.timeSeconds) / 3600; // 秒转成小时
          let speeds = Math.ceil(distance / times); // 最终得到的速度是 km/h
          navg = pathSimplifierIns.createPathNavigator(0, {
            loop: true,
            speed: speeds,
            pathNavigatorStyle: {
              width: 12,
              height: 18,
              strokeStyle: null,
              fillStyle: null,
              // 使用图片
              content: PathSimplifier.Render.Canvas.getImageContent(
                "../../../static/img/car.png"
              )
            }
          });
        });
        let startPot = this.lineArr[0];
        let endPot = this.lineArr[this.lineArr.length - 1];
        let start = new AMap.Marker({
          map: map,
          position: [startPot[0], startPot[1]], // 基点位置  开始位置
          icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
          zIndex: 50
        });
        let end = new AMap.Marker({
          map: map,
          position: [endPot[0], endPot[1]], // 基点位置  结束位置
          icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
          zIndex: 10
        });
        this.markerArr.push(start);
        this.markerArr.push(end);
      });
    },
    // 列表点击事件
    checkItem(item) {
      Indicator.open();
      this.toggleList();
      let params = {
        pushDateStart: timeFormatSort(this.startpickerValue),
        pushDateEnd: timeFormatSort(this.endpickerValue)
      };
      params.batteryId = item.batteryId;
      this.devicelabel = item.batteryId;
      this.getData(params);
    },
    // 开始运动
    startOnclick() {
      this.actived = 'start';
      navg.start();
    },
    // 暂停运动
    pauseOnclick() {
      this.actived = 'pause';
      navg.pause();
    },
    // 继续运动
    resumeOnclick() {
      this.actived = 'resume';
      navg.resume();
    },
    // 停止运动
    stopOnclick() {
      this.actived = 'stop';
      navg.stop();
      // map.clearMap();
    },
    /*
    * heatmap：hide()          ---- 隐藏热力图
    *          show()          ---- 显示热力图
    * pathSimplifierIns： hide() ---- 隐藏轨迹
    *                     show() ---- 显示轨迹
    */
    historyShow() {
      pathSimplifierIns.show();
      heatmap.hide();
    },
    heatShow() {
      pathSimplifierIns.hide();
      heatmap.show();
    }
  },
  beforeDestroy() {
    map.destroy();
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
    height: 100%;
    width: 100%;
  }
  .control {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: px2rem(14px);
    border-bottom: 1px solid #f0f0f0;
    z-index: 10;
    background: #ffffff;
    input {
      font-size: px2rem(13px);
      width: 35%;
      text-align: center;
    }
  }
  .btns {
    position: absolute;
    top: 42px;
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
        margin-right: 3px;
        box-shadow: 0px 0px 10px #333333;
        &.active {
          background: #fff;
          border-color: #409EFF;
          color: #409EFF;
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
    top: 43px;
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
      height: auto;
      li {
        font-size: px2rem(12px);
        padding: px2rem(6px) px2rem(5px);
        position: relative;
        border-bottom: px2rem(1px) solid #f5f5f5;
        &.selected {
          background: green;
          color: #fff;
        }
        &.pages {
          display: flex;
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
  }
}
</style>
