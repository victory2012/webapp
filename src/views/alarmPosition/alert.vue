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
import AMap from "AMap";
import { getFence, websockets, singleDeviceId } from "../../api/index";
import { onWarn, onError } from "../../utils/callback";
let map;
let polygonArr = [];
let pointerObj = {};
export default {
  data () {
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
    hasFence (gpsList) {
      const stringGPS = gpsList.toString();
      let sort = stringGPS.substring(0, stringGPS.length - 1);
      let poi = sort.split(';');
      let allPointers = [];
      poi.forEach((res, index) => {
        let item = res.split(",");
        let arr = [item[0], item[1]];
        new AMap.Marker({
          icon: new AMap.Icon({
            image: `http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png`,
            size: new AMap.Size(20, 35)
          }),
          position: arr,
          zIndex: 101,
          clickable: true,
          map: map
        });
        allPointers.push(arr);
      });
      /** 画多边形 */
      let polygons = new AMap.Polygon({
        map: map,
        strokeColor: "#0000ff",
        strokeWeight: 2,
        fillColor: "#f5deb3",
        fillOpacity: 0.6,
        // extData: id,
        cursor: "pointer"
      });
      polygons.setPath(allPointers);
      polygonArr.push(polygons);

      map.setFitView(); // 地图自适应
    },
    /* goBack 返回 */
    goBack () {
      this.$router.push({
        path: "alarmdata"
      });
    },
    getData () {
      getFence().then(res => {
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
      });
    },
    init () {
      if (this.grid) {
        let point = this.grid.split(";");
        map = new AMap.Map("AddContainer", {
          center: [point[0], point[1]],
          resizeEnable: true,
          zoom: 5
        });
        console.log(point);
        new AMap.Marker({
          map: map,
          position: new AMap.LngLat(point[0], point[1]),
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
          label: {
            content: `${this.$t("googleAbno.Geofence")}`,
            offset: new AMap.Pixel(20, 20)
          }
        });
      } else {
        map = new AMap.Map("AddContainer", {
          resizeEnable: true,
          zoom: 5
        });
      }
      if (this.efence) {
        this.hasFence(this.efence);
      }
    },
    mapInit (obj) {
      let allmarkerArr = Object.values(obj);
      allmarkerArr.forEach(key => {
        let lngs = key.toString().split(",");
        let marker = new AMap.Marker({
          icon: new AMap.Icon({
            image: `http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png`,
            size: new AMap.Size(20, 35)
          }),
          position: [lngs[0], lngs[1]],
          offset: new AMap.Pixel(-12, -12),
          zIndex: 101,
          map: map
        });
        marker.setLabel({
          offset: new AMap.Pixel(20, 20),
          content: `${this.$t("googleAbno.nowPosition")}`
        });
        this.markers.push(marker);
      });
    },
    localPosition () {
      let NowDeviceId = this.$route.query.deviceId;
      singleDeviceId(NowDeviceId).then(res => {
        if (res.data.code === 0) {
          let result = res.data.data;
          console.log(result);
          if (result) {
            pointerObj[result.deviceId] = `${result.longitude},${
              result.latitude
              }`;
            this.sendData.param.push(result.deviceId);
            this.mapInit(pointerObj);
            this.sockets(JSON.stringify(this.sendData));
          }
        }
      });
    },
    sockets (sendData) {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          ws.send(sendData);
        };
        ws.onmessage = evt => {
          let data = JSON.parse(evt.data);
          console.log(data);
          if (data.code === 2) {
            if (this.markers.length > 0) {
              map.remove(this.markers);
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
    }
  },
  mounted () {
    this.grid = this.$route.query.grid;
    this.efence = this.$route.query.efence;
    this.init();
  },
  beforeDestroy () {
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
