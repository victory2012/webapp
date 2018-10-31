<template>
  <div class="outer-box">
    <div id="AddContainer" class="fenceContainer"></div>
    <div class="HandleBtn" v-if="addFence">
      <!-- <span class="Tiptext">Tip：选择区域后，鼠标右键结束选区</span> -->
      <mt-button size="small" @click="cancelSetings" type="default">{{$t('fence.cancelSeting')}}</mt-button>
      <mt-button size="small" @click="doAddFence" type="primary">{{$t('fence.sureSeting')}}</mt-button>
      <mt-button size="small" @click="goBack" type="danger">{{$t('fence.back')}}</mt-button>
      <p></p>
    </div>
    <div class="HandleBtn" v-else>
      <mt-button size="small" @click="ToAddFence" type="primary">{{$t('fence.addBtn')}}</mt-button>
      <mt-button size="small" @click="ToDeleteFence" type="danger">{{$t('fence.delBtn')}}</mt-button>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import { Indicator } from "mint-ui";
import { getFence, addFence, delFence } from "../../api/index";
import { onTimeOut, onError, onWarn, onSuccess } from "../../utils/callback";
let map;
let marker;
let markers = [];
let mouseTool;
let mouseToolArr = [];
let polygonArr = [];
// let allPointers = [];
export default {
  data() {
    return {
      addFence: false,
      json: "",
      fenceId: "",
      polygon: null
    };
  },
  methods: {
    // 没有设置过围栏
    buildFence() {
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
    callBackFn(e) {
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
    hasFence(gpsList, id) {
      Indicator.close();
      map.off("click", this.callBackFn);
      mouseTool.close(false);
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
    doAddFence() {
      let gpsObj = {
        gpsList: this.json.substring(0, this.json.length - 1)
      };
      if (!gpsObj.gpsList) {
        onError(`${this.$t("fence.tipMsg.addPointer")}`);
        return;
      }
      Indicator.open();
      addFence(gpsObj).then(res => {
        Indicator.close();

        if (res.data.code === 0) {
          onSuccess(`${this.$t("fence.tipMsg.addSuccess")}`);
          this.cancelSetings();
          this.getData();
        }
      });
    },
    /* 取消设置 */
    cancelSetings() {
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
    ToDeleteFence() {
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
    goBack() {
      this.cancelSetings();
      this.addFence = false;
      map.setDefaultCursor(); // 手势
      map.off("click", this.callBackFn); // 移除地图点击事件
      mouseTool.close(false); // 移除 画多边形的功能
      // this.getData();
    },
    getData() {
      getFence().then(res => {
        // console.log(res);

        if (res.data.code === 0) {
          if (res.data.data.length > 0) {
            let result = res.data.data;
            result.forEach(key => {
              let gpsList = key.gpsList;
              let id = key.id;
              this.hasFence(gpsList, id);
            });
          } else {
            this.buildFence();
          }
        }
      });
    },
    ToAddFence() {
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
    },
    init() {
      const lang = localStorage.getItem("locale") === "en" ? "en" : "zh_cn";
      map = new AMap.Map("AddContainer", {
        resizeEnable: true,
        lang: lang,
        zoom: 5
      });
      Indicator.open();
      this.getData();
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    map.destroy();
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
  .fenceContainer {
    width: 100%;
    height: 100%;
  }
  .HandleBtn {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 0;
    button {
      font-size: px2rem(14px);
      margin-left: 3px;
    }
  }
}
</style>
