<template>
  <div class="outer-box">
    <div id="AddContainer"
      class="fenceContainer"></div>
    <div class="HandleBtn"
      v-show="addFence">
      <!-- <span class="Tiptext">Tip：选择区域后，鼠标右键结束选区</span> -->
      <mt-button size="small"
        @click="cancelSetings"
        type="default">{{$t('fence.cancelSeting')}}</mt-button>
      <mt-button size="small"
        @click="doAddFence"
        type="primary">{{$t('fence.sureSeting')}}</mt-button>
      <mt-button size="small"
        @click="goBack"
        type="danger">{{$t('fence.back')}}</mt-button>
      <p></p>
    </div>
    <div class="HandleBtn"
      v-show="!addFence">
      <mt-button size="small"
        @click="ToAddFence"
        type="primary">{{$t('fence.addBtn')}}</mt-button>
      <mt-button size="small"
        @click="ToDeleteFence"
        type="danger">{{$t('fence.delBtn')}}</mt-button>
    </div>
    <div class="batteryList"
      :class="{'closed': GETfenceList}">
      <div class="titles">{{$t('positions.title2')}}</div>
      <p @click="toggleList"
        class="controlBtn">
        <i :class="{'roted': !GETfenceList}"></i>
      </p>
      <ul>
        <li v-for="(item, index) in pointerArr"
          :class="{'selected': chooseId === item.batteryId }"
          :key="item.deviceId"
          @click="checkItem(item)">
          <p>{{index + 1}}、{{item.batteryId}}</p>
        </li>
      </ul>
      <div class="pages">
        <div @click="previous"
          :class="[previousBtn?'':'disable']">{{$t('pageBtn.previous')}}</div>
        <div @click="next"
          :class="[naxtBtn ? '': 'disable' ]">{{$t('pageBtn.next')}}</div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { mapGetters } from 'vuex';
import google from "google";
import { Indicator } from "mint-ui";
import {
  getFence,
  addFence,
  delFence,
  GetDeviceList,
  getFenceById
} from "@/api/index";
import { onError, onWarn, onSuccess } from "@/utils/callback";

let map;
// let mouseTool;
let bermudaTriangleArr = [];
// let drawingManager = null;
let label = 1;
export default {
  data () {
    return {
      selectPonter: [],
      chooseId: "",
      naxtBtn: false,
      previousBtn: false,
      addFence: false,
      pageNum: 1,
      pointerArr: [],
      closed: true,
      fenceId: "",
      markers: [],
      polygon: null,
      fencePonter: ""
    };
  },
  computed: {
    ...mapGetters(['GETfenceList'])
  },
  methods: {
    init () {
      try {
        map = new google.maps.Map(document.getElementById("AddContainer"), {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 15
        });
        this.getListData();
      } catch (err) {
        onError(this.$t("mapError"));
      }
    },
    // 打开&&关闭列表
    toggleList () {
      this.$store.commit('setfenceList', !this.GETfenceList)
    },
    checkItem (item) {
      this.label = 1;
      // this.addFence = false;
      this.cancelSetings();
      // this.goBack();
      this.clickItme = item;
      this.chooseId = item.batteryId;
      Indicator.open();
      this.getFenceData({
        batteryId: item.batteryId,
        deviceId: item.deviceId
      });
    },
    next () {
      if (this.pageNum < this.total) {
        this.pageNum = this.pageNum + 1;
        this.getListData();
      }
    },
    previous () {
      if (this.pageNum > 1) {
        this.pageNum = this.pageNum - 1;
        this.getListData();
      }
    },
    getListData () {
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 10,
        bindingStatus: 1
      };
      Indicator.open();
      GetDeviceList(pageObj).then(res => {
        console.log(res.data);
        // Indicator.close();
        if (res.data && res.data.code === 0) {
          this.pointerArr = [];
          let result = res.data.data;
          this.total = result.totalPage;
          console.log("this.total", this.total);
          this.naxtBtn = this.pageNum < this.total ? true : false;
          this.previousBtn = this.pageNum === 1 ? false : true;
          this.pointerArr = [...result.data];
          if (this.pointerArr.length > 0) {
            this.clickItme = this.pointerArr[0];
            this.chooseId = this.clickItme.batteryId;
            this.getFenceData({
              batteryId: this.clickItme.batteryId,
              deviceId: this.clickItme.deviceId
            });
          }
        }
      });
    },
    getFenceData (data) {
      getFenceById(data).then(res => {
        console.log("getFenceById", res);
        Indicator.close();
        if (res.data && res.data.code === 0) {
          if (bermudaTriangleArr.length > 0) {
            bermudaTriangleArr.forEach(key => {
              key.setMap(null);
            });
          }
          let result = res.data.data;
          if (result) {
            this.addFence = false;
            this.hasFenced = true;
            let gpsList = result.gpsList;
            let id = result.id;
            this.hasFence(gpsList, id);
          } else {
            this.addFence = true;
            this.hasFenced = false;
            // this.buildFence();
          }
        }
      });
    },
    // 没有设置过围栏
    buildFence () {
      this.addFence = true;
      label = 1;
      this.markers = [];
      this.fencePonter = "";
      google.maps.event.clearListeners(map, "click");
      google.maps.event.addListener(map, "click", event => {
        console.log(event.latLng);
        console.log(event);
        let marker = new google.maps.Marker({
          position: event.latLng,
          label: `${label++}`,
          map: map
        });
        this.selectPonter.push(`${event.latLng.lng().toFixed(6)},${event.latLng.lat().toFixed(6)}`);
        this.markers.push(marker);
        if (label > 10) {
          google.maps.event.clearListeners(map, "click");
        }
      });
    },
    // 已经添加了围栏，根据围栏坐标 画出围栏
    hasFence (gpsList, id) {
      this.addFence = false;
      let poi = gpsList.substring(0, gpsList.length - 1).split(";");
      let allPointers = [];
      let bounds = new google.maps.LatLngBounds();
      poi.forEach((res, index) => {
        let item = res.split(",");
        let arr = new google.maps.LatLng(item[1], item[0]);
        bounds.extend(arr);
        allPointers.push(arr);
      });
      map.fitBounds(bounds); // 自适应显示
      var bermudaTriangle = new google.maps.Polygon({
        paths: [...allPointers],
        strokeColor: "blue",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#FFC107",
        fillOpacity: 0.6
      });
      bermudaTriangleArr.push(bermudaTriangle);
      bermudaTriangle.setMap(map);
      bermudaTriangle.addListener("click", e => {
        this.fenceId = id;
        bermudaTriangleArr.forEach(key => {
          key.setOptions({
            fillColor: "#FFC107"
          });
        });
        bermudaTriangle.setOptions({
          fillColor: "#FF0000",
          fillOpacity: 0.8
        });
      });
    },
    unique (arr) {
      return Array.from(new Set(arr))
    },
    // 确认设置 添加围栏
    doAddFence () {
      let pointer = this.unique(this.selectPonter);
      if (pointer.length === 0) {
        onError(`${this.$t("fence.tipMsg.addPointer")}`);
        return;
      }
      if (pointer.length < 3) {
        onError(`${this.$t("fence.tipMsg.less")}`);
        return;
      }
      let gpsList = '';
      pointer.forEach(key => {
        gpsList += key + ';'
      })
      let gpsObj = {
        deviceId: this.clickItme.deviceId,
        batteryId: this.clickItme.batteryId,
        gpsList: gpsList
      };
      addFence(gpsObj).then(res => {
        console.log(res);
        if (res.data && res.data.code === 0) {
          google.maps.event.clearListeners(map, "click");
          if (this.markers.length > 0) {
            this.markers.forEach(key => {
              key.setMap(null);
            });
            this.markers = [];
          }
          // drawingManager.setDrawingMode(null);
          onSuccess(this.$t("fence.tipMsg.addSuccess"));
          this.getFenceData({
            batteryId: this.clickItme.batteryId,
            deviceId: this.clickItme.deviceId
          });
        }
      });
    },
    /* 取消设置 */
    cancelSetings () {
      this.addFence = true;
      this.fencePonter = "";
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      this.buildFence();
    },
    /* 删除围栏 */
    ToDeleteFence () {
      if (!this.fenceId) {
        onWarn(this.$t("fence.tipMsg.selectToDel"));
        return;
      }
      delFence(this.fenceId).then(res => {
        console.log(res);

        if (res.data && res.data.code === 0) {
          this.selectPonter = [];
          onSuccess(this.$t("fence.tipMsg.delSuccess"));
          this.getFenceData({
            batteryId: this.clickItme.batteryId,
            deviceId: this.clickItme.deviceId
          });
        }
      });
    },
    /* goBack 返回 */
    goBack () {
      this.addFence = false;
      this.fencePonter = "";
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      label = 1;
      google.maps.event.clearListeners(map, "click");
      this.getFenceData({
        batteryId: this.clickItme.batteryId,
        deviceId: this.clickItme.deviceId
      });
    },
    ToAddFence () {
      if (this.hasFenced) return;
      this.selectPonter = [];
      this.buildFence();
    }
  },
  mounted () {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
@import url("../../common/style/index.scss");

.outer-box {
  position: absolute;
  top: $baseHeader;
  right: 0;
  bottom: 0;
  left: 0;
  .batteryList {
    position: absolute;
    top: 10px;
    right: 0;
    width: px2rem(150px);
    z-index: 99;
    background: #fafafa;
    padding: px2rem(6px) px2rem(4px);
    height: auto;
    line-height: px2rem(24px);
    transition: all 0.3s ease-in;
    .titles {
      font-size: 14px;
      text-align: center;
      border-bottom: 1px solid #e5e5e5;
    }
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
          // width: 80%;
          .hisBad {
            border: 1px solid #f0f0f0;
            border-radius: 5px;
            padding: 4px;
            background: #98dbff;
            color: #ffffff;
          }
          .onlines {
            position: absolute;
            top: -20px;
            right: 0;
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
  .fenceContainer {
    width: 100%;
    height: 100%;
  }
  .HandleBtn {
    position: absolute;
    top: 5px;
    left: 5px;
    font-size: 0;
    button {
      font-size: px2rem(14px);
      margin-left: 3px;
    }
  }
}
</style>
