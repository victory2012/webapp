<template>
  <div class="outer-box">
    <div id="AddContainer" class="fenceContainer"></div>
    <div class="HandleBtn">
      <mt-button size="small" @click="goBack" type="primary">{{$t('googleAbno.return')}}</mt-button>
    </div>
    <div class="localPosition" @click="localPosition" :title="$t('googleAbno.title')">
      <img src="../../../static/img/local_normal.png" alt="">
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import google from "google";
import { getFence, websockets, singleDeviceId } from "@/api/index";
import { onTimeOut, onError } from "@/utils/callback";

let map;

let pointerObj = {};
export default {
  data() {
    return {
      grid: "",
      efence: "",
      json: "",
      fenceId: "",
      polygon: null,
      sendData: { api: "bind", param: [] },
      markers: []
    };
  },
  methods: {
    // 已经添加了围栏，根据围栏坐标 画出围栏
    hasFence(gpsList) {
      let poi = gpsList.substring(0, gpsList.length - 1).split(";");
      let allPointers = [];
      poi.forEach(res => {
        let item = res.split(",");
        let arr = new google.maps.LatLng(item[1], item[0]);
        allPointers.push(arr);
      });
      let bermudaTriangle = new google.maps.Polygon({
        paths: [allPointers],
        strokeColor: "blue",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#FFC107",
        fillOpacity: 0.6
      });
      bermudaTriangle.setMap(map);
    },
    /* goBack 返回 */
    goBack() {
      this.$router.push({
        path: "alarmdata"
      });
    },
    getData() {
      getFence().then(res => {
        if (res.data.code === 1) {
          onTimeOut(this.$router);
        }
        if (res.data.code === 0) {
          if (res.data.data.length > 0) {
            let result = res.data.data;
            result.forEach(key => {
              // console.log("key", key);
              let gpsList = key.gpsList;
              let id = key.id;
              this.hasFence(gpsList, id);
            });
          }
        }
        if (res.data.code === -1) {
          onError(res.data.msg);
        }
      });
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
        if (this.grid) {
          let point = this.grid.split(";");
          let outPointer = new google.maps.LatLng(point[1], point[0]);
          map.setCenter(outPointer);
          new google.maps.Marker({
            position: outPointer,
            label: "out",
            title: `${this.$t("googleAbno.Geofence")}`,
            map: map
          });
        }
        if (this.efence) {
          this.hasFence(this.efence);
        }
      } catch (err) {
        onError(`${this.$t("mapError")}`);
      }
    },
    mapInit(obj) {
      let allmarkerArr = Object.values(obj);
      allmarkerArr.forEach(key => {
        let lngs = key.toString().split(",");
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng(lngs[1], lngs[0]),
          title: `${this.$t("googleAbno.nowPosition")}`,
          label: "now",
          map: map
        });
        this.markers.push(marker);
      });
    },
    localPosition(rest) {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          ws.send(rest);
        };
        ws.onmessage = evt => {
          let data = JSON.parse(evt.data);
          console.log(data);
          if (data.code === 2) {
            if (this.markers.length > 0) {
              this.markers.forEach(key => {
                key.setMap(null);
              });
              this.markers = [];
            }
            // code 为 1时 既绑定成功，2时为 收到了数据
            let obj = data.data.split(",");
            obj.forEach(() => {
              pointerObj[obj[0]] = `${obj[2]},${obj[1]}`;
            });
            this.mapInit(pointerObj);
          }
        };
        ws.onerror = () => {
          console.log("onerror...");
          onError(`${this.$t("connectErr")}`);
          this.over();
        };
        this.over = () => {
          ws.close();
        };
      });
    },
    singleDevice() {
      let NowDeviceId = this.$route.query.deviceId;
      singleDeviceId(NowDeviceId)
        .then(res => {
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
            let result = res.data.data;
            console.log(result);
            if (this.markers.length > 0) {
              this.markers.forEach(key => {
                key.setMap(null);
              });
              this.markers = [];
            }
            if (result) {
              pointerObj[result.deviceId] = `${result.longitude},${
                result.latitude
              }`;
              this.sendData.param.push(result.deviceId);
              this.mapInit(pointerObj);
              this.localPosition(JSON.stringify(this.sendData));
            }
          }
          if (res.data.code === -1) {
            onError(res.data.msg);
          }
        })
        .catch(() => {
          onError(`${this.$t("internetErr")}`);
        });
    }
  },
  mounted() {
    this.grid = this.$route.query.grid;
    this.efence = this.$route.query.efence;
    this.init();
  },
  beforeDestroy() {
    if (typeof this.over === "function") {
      this.over();
    }
  }
};
</script>
<style lang="scss" scoped>
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
    font-size: 0;
    position: absolute;
    top: px2rem(10px);
    right: px2rem(10px);
  }
  .localPosition {
    position: absolute;
    width: px2rem(35px);
    height: px2rem(35px);
    padding: px2rem(5px);
    bottom: px2rem(30px);
    left: px2rem(20px);
    z-index: 99;
    background: #ffffff;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0px 0px 10px #333333;
    font-size: 0;
  }
  .localPosition img {
    width: px2rem(25px);
    height: auto;
  }
}
</style>
