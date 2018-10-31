<template>
  <div class="outer-box">
    <div id="AddContainer" class="fenceContainer"></div>
    <div class="HandleBtn">
      <mt-button size="small" @click="goBack" type="primary">返回</mt-button>
    </div>
    <div class="localPosition" @click="localPosition" title="查看设备当前位置">
      <img src="../../../static/img/local_normal.png" alt="">
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import { getFence, websockets, singleDeviceId } from "../../api/index";
import { onTimeOut, onWarn, onError } from "../../utils/callback";
let map;
let grid;
let polygonArr = [];
let pointerObj = {};
export default {
  data() {
    return {
      json: "",
      fenceId: "",
      polygon: null,
      sendData: { api: "bind", param: [] },
      markers: []
    };
  },
  methods: {
    // 已经添加了围栏，根据围栏坐标 画出围栏
    hasFence(gpsList, id) {
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
        console.log("e", e);
        if (polygonArr.length > 0) {
          polygonArr.forEach(key => {
            // console.log("key", key);
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
        console.log(e.target.getExtData());
        // console.log(e.target.getPath());
      });
      map.setFitView(); // 地图自适应
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
      if (grid) {
        let point = grid.split(";");
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
            content: "超出围栏点",
            offset: new AMap.Pixel(20, 20)
          }
        });
      } else {
        map = new AMap.Map("AddContainer", {
          resizeEnable: true,
          zoom: 5
        });
      }
      this.getData();
    },
    mapInit(obj) {
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
          content: "当前实时位置"
        });
        this.markers.push(marker);
      });
    },
    localPosition() {
      let NowDeviceId = this.$route.query.deviceId;
      singleDeviceId(NowDeviceId)
        .then(res => {
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
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
    sockets(sendData) {
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
          onError("服务器繁忙，请稍后重试。");
          this.over();
        };
        this.over = () => {
          ws.close();
        };
      });
    }
  },
  mounted() {
    grid = this.$route.query.grid;
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
