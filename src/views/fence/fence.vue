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
import google from "google";
// import { Indicator } from "mint-ui";
import { getFence, addFence, delFence } from "../../api/index";
import { onError, onWarn, onSuccess } from "../../utils/callback";

let map;
let markers = [];
// let mouseTool;
let bermudaTriangleArr = [];
// let drawingManager = null;
let label = 1;
export default {
  data() {
    return {
      addFence: false,
      fenceId: "",
      markers: [],
      polygon: null,
      fencePonter: ""
    };
  },
  methods: {
    // 没有设置过围栏
    buildFence() {
      this.addFence = true;
      label = 1;
      markers = [];
      this.fencePonter = "";
      google.maps.event.addListener(map, "click", event => {
        console.log(event.latLng);
        console.log(event);
        let marker = new google.maps.Marker({
          position: event.latLng,
          label: `${label++}`,
          map: map
        });
        this.fencePonter += `${event.latLng
          .lng()
          .toFixed(6)},${event.latLng.lat().toFixed(6)};`;
        // str += `${event.latLng}`
        console.log(this.fencePonter);
        markers.push(marker);
        if (label > 10) {
          google.maps.event.clearListeners(map, "click");
        }
      });
    },
    // 已经添加了围栏，根据围栏坐标 画出围栏
    hasFence(gpsList, id) {
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
      let bermudaTriangle = new google.maps.Polygon({
        paths: [allPointers],
        strokeColor: "blue",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#FFC107",
        fillOpacity: 0.6
      });
      bermudaTriangleArr.push(bermudaTriangle);
      bermudaTriangle.setMap(map);
      bermudaTriangle.addListener("click", () => {
        console.log("围栏id", id);
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
    // 确认设置 添加围栏
    doAddFence() {
      let gpsObj = {};
      // let str = "";
      console.log(this.fencePonter);
      if (this.fencePonter.length > 0) {
        gpsObj.gpsList = this.fencePonter.substring(
          0,
          this.fencePonter.length - 1
        );
        addFence(gpsObj).then(res => {
          console.log(res);

          if (res.data && res.data.code === 0) {
            google.maps.event.clearListeners(map, "click");
            if (markers.length > 0) {
              markers.forEach(key => {
                key.setMap(null);
              });
              markers = [];
            }
            // drawingManager.setDrawingMode(null);
            onSuccess(this.$t("fence.tipMsg.addSuccess"));
            this.getData();
          }
        });
      } else {
        onError(this.$t("fence.tipMsg.addPointer"));
      }
    },
    /* 取消设置 */
    cancelSetings() {
      this.addFence = true;
      this.fencePonter = "";
      if (markers.length > 0) {
        markers.forEach(key => {
          key.setMap(null);
        });
        markers = [];
      }
      this.buildFence();
    },
    /* 删除围栏 */
    ToDeleteFence() {
      if (!this.fenceId) {
        onWarn(this.$t("fence.tipMsg.selectToDel"));
        return;
      }
      delFence(this.fenceId).then(res => {
        console.log(res);

        if (res.data && res.data.code === 0) {
          onSuccess(this.$t("fence.tipMsg.delSuccess"));
          this.getData();
        }
      });
    },
    /* goBack 返回 */
    goBack() {
      this.addFence = false;
      this.fencePonter = "";
      if (markers.length > 0) {
        markers.forEach(key => {
          key.setMap(null);
        });
        markers = [];
      }
      label = 1;
      google.maps.event.clearListeners(map, "click");
    },
    getData() {
      getFence().then(res => {
        console.log(res);

        if (res.data && res.data.code === 0) {
          if (bermudaTriangleArr.length > 0) {
            bermudaTriangleArr.forEach(key => {
              key.setMap(null);
            });
          }
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
      this.buildFence();
    },
    init() {
      try {
        map = new google.maps.Map(document.getElementById("AddContainer"), {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 15
        });
        this.getData();
      } catch (err) {
        onError(this.$t("mapError"));
      }
    }
  },
  mounted() {
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
