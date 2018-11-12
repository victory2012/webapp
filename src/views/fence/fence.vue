<template>
  <div class="outer-box">
    <div id="AddContainer"
      class="fenceContainer"></div>
    <div class="HandleBtn"
      v-if="addFence">
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
      v-else>
      <mt-button size="small"
        @click="ToAddFence"
        type="primary">{{$t('fence.addBtn')}}</mt-button>
      <mt-button size="small"
        @click="ToDeleteFence"
        type="danger">{{$t('fence.delBtn')}}</mt-button>
    </div>
    <div class="batteryList"
      :class="[closed? 'closed': '']">
      <div class="titles">{{$t('positions.title2')}}</div>
      <p @click="toggleList"
        class="controlBtn">
        <i :class="{'roted': !closed}"></i>
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
import AMap from "AMap";
import { Indicator } from "mint-ui";
import {
  getFence,
  addFence,
  delFence,
  getFenceById,
  GetDeviceList
} from "../../api/index";
import { onTimeOut, onError, onWarn, onSuccess } from "../../utils/callback";
let map;
let marker;
let markers = [];
let mouseTool;
let mouseToolArr = [];
let polygonArr = [];
// let allPointers = [];
export default {
  data () {
    return {
      chooseId: "",
      naxtBtn: false,
      previousBtn: false,
      pointerArr: [],
      pageNum: 1,
      closed: false,
      addFence: false,
      json: "",
      fenceId: "",
      polygon: null
    };
  },
  methods: {
    init () {
      const lang = localStorage.getItem("locale") === "en" ? "en" : "zh_cn";
      map = new AMap.Map("AddContainer", {
        resizeEnable: true,
        lang: lang,
        zoom: 5
      });
      Indicator.open();
      this.getListData();
    },
    // 打开&&关闭列表
    toggleList () {
      this.closed = !this.closed;
    },
    checkItem (item) {
      this.clickItme = item;
      this.chooseId = this.clickItme.batteryId;
      Indicator.open();
      this.getFenceData({
        batteryId: this.clickItme.batteryId,
        deviceId: this.clickItme.deviceId
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
        if (res.data.code === 0) {
          this.json = "";
          map.clearMap();
          // markers && map.remove(markers); // 清除marker点
          // mouseTool && mouseTool.close(true); // 清除多边形
          // markers = [];
          let result = res.data.data;
          if (result) {
            map.setDefaultCursor(); // 手势
            map.off("click", this.callBackFn); // 移除地图点击事件
            mouseTool && mouseTool.close(false); // 移除 画多边形的功能
            this.hasFenced = true;
            let gpsList = result.gpsList;
            let id = result.id;
            this.hasFence(gpsList, id);
          } else {
            this.hasFenced = false;
            // this.buildFence();
          }
        }
      });
    },
    // 没有设置过围栏
    buildFence () {
      Indicator.close();
      this.addFence = true;
      map.plugin(["AMap.MouseTool"], () => {
        mouseTool = new AMap.MouseTool(map);
        mouseTool.polygon();
        // this.mouseTool.close(true); // 移除 画多边形的功能
        mouseToolArr.push(mouseTool);
      });
      map.setDefaultCursor("pointer"); // 手势
      map.on("click", this.callBackFn); // 地图的点击事件
      /*
      * 鼠标右击事件 右击后 要移除地图的点击事件 和画多边形的事件
      */
      map.on("rightclick", () => {
        map.setDefaultCursor(); // 手势
        map.off("click", this.callBackFn); // 移除地图点击事件
        mouseTool.close(false); // 移除 画多边形的功能
      });
    },
    callBackFn (e) {
      if (markers.length === 9) {
        mouseTool.close(false); // 移除 画多边形的功能
      }
      if (markers.length > 9) {
        map.setDefaultCursor(); // 手势
        map.off("click", this.callBackFn); // 移除地图点击事件
        // mouseTool.close(false); // 移除 画多边形的功能
      } else {
        this.json += `${e.lnglat.getLng()},${e.lnglat.getLat()};`; // 获取地图点击的jps坐标位置 集合
        marker = new AMap.Marker({
          map: map,
          position: [e.lnglat.getLng(), e.lnglat.getLat()]
        });
        markers.push(marker);
      }
    },
    // 已经添加了围栏，根据围栏坐标 画出围栏
    hasFence (gpsList, id) {
      Indicator.close();
      map.off("click", this.callBackFn);
      mouseTool && mouseTool.close(false);
      this.addFence = false;
      let poi = gpsList.split(";");
      let allPointers = [];
      poi.forEach(res => {
        let item = res.split(",");
        let arr = [item[0], item[1]];
        allPointers.push(arr);
      });
      /** 画多边形 */
      let polygons = new AMap.Polygon({
        map: map,
        strokeColor: "#0000ff",
        strokeWeight: 2,
        fillColor: "#f5deb3",
        fillOpacity: 0.6,
        extData: id,
        cursor: "pointer"
      });
      polygons.setPath(allPointers);
      polygonArr.push(polygons);
      polygons.on("click", e => {
        if (polygonArr.length > 0) {
          polygonArr.forEach(key => {
            key.setOptions({
              strokeColor: "#0000ff",
              fillColor: "#f5deb3",
              fillOpacity: 0.6,
              cursor: "pointer"
            });
            if (e.target.getExtData() === key.G.extData) {
              this.polygon = key;
            }
          });
        }
        e.target.setOptions({
          strokeColor: "#0000ff",
          fillColor: "red",
          fillOpacity: 0.6
        });
        this.fenceId = e.target.getExtData();
      });
      map.setFitView(); // 地图自适应
    },
    // 确认设置 添加围栏
    doAddFence () {
      if (!this.json) {
        onError(`${this.$t("fence.tipMsg.addPointer")}`);
        return;
      }
      let gpsList = this.json.substring(0, this.json.length - 1);
      let pointer = gpsList.split(';');
      if (pointer.length < 3) {
        onError(`${this.$t("fence.tipMsg.less")}`);
        return;
      }
      let gpsObj = {
        deviceId: this.clickItme.deviceId,
        batteryId: this.clickItme.batteryId,
        gpsList: gpsList
      };
      Indicator.open();
      addFence(gpsObj).then(res => {
        Indicator.close();

        if (res.data.code === 0) {
          onSuccess(`${this.$t("fence.tipMsg.addSuccess")}`);
          this.cancelSetings();
          Indicator.open();
          this.getFenceData({
            batteryId: this.clickItme.batteryId,
            deviceId: this.clickItme.deviceId
          });
        }
      });
    },
    /* 取消设置 */
    cancelSetings () {
      this.json = "";
      markers && map.remove(markers); // 清除marker点
      mouseTool.close(true); // 清除多边形
      markers = [];
      mouseTool = null;
      /*
      * 点击取消设置后 需要恢复地图的点击事件 和 “AMap.MouseTool”画多边形事件
      * 所以 在执行一下 buildFence（）方法 即可解决
      */
      this.buildFence();
    },
    /* 删除围栏 */
    ToDeleteFence () {
      if (!this.fenceId) {
        onWarn(`${this.$t("fence.tipMsg.selectToDel")}`);
        return;
      }
      Indicator.open();
      delFence(this.fenceId).then(res => {
        Indicator.close();

        if (res.data.code === 0) {
          onSuccess(`${this.$t("fence.tipMsg.delSuccess")}`);
          this.polygon.setMap(null);
        }
      });
    },
    /* goBack 返回 */
    goBack () {
      this.cancelSetings();
      this.addFence = false;
      map.setDefaultCursor(); // 手势
      map.off("click", this.callBackFn); // 移除地图点击事件
      mouseTool.close(false); // 移除 画多边形的功能
      this.getFenceData({
        batteryId: this.clickItme.batteryId,
        deviceId: this.clickItme.deviceId
      });
    },
    ToAddFence () {
      if (this.hasFenced) return;
      this.addFence = true;
      markers = [];
      // console.log(mouseToolArr);
      if (mouseToolArr.length > 0) {
        mouseToolArr.forEach(key => {
          key.close(false);
        });
      }
      mouseTool = null;
      // console.log(polygonArr);
      if (polygonArr.length > 0) {
        polygonArr.forEach(key => {
          key.hide();
        });
      }
      mouseToolArr = [];
      polygonArr = [];
      this.buildFence();
    }
  },
  mounted () {
    this.init();
  },
  beforeDestroy () {
    map.destroy();
  }
};
</script>
<style lang="scss" scoped>
@import url('../../common/style/index.scss');
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
        background: url('../../assets/open.png') no-repeat;
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
