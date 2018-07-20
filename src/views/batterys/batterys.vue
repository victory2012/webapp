<template>
  <div class="warrp">
    <div id="container" class="mapWarrp"></div>
  </div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import { websockets, GetDeviceList } from "../../api/index";
import { onTimeOut, onError, onWarn } from "../../utils/callback";

let map;
let polygons = [];
let district;
let pointerObj = {};
export default {
  name: "battery",
  data() {
    return {
      lnglats: [],
      onLine: 0,
      allDevice: 0,
      limit: false,
      offLine: 0,
      markers: [],
      sendData: { api: "bind", param: [] },
      selectArr: [
        {
          adcode: "all",
          name: "全国"
        }
      ],
      defaultOption: "全国"
    };
  },
  methods: {
    getCityData(data) {
      let bounds = data.boundaries;
      if (bounds) {
        for (let i = 0, l = bounds.length; i < l; i++) {
          let polygon = new AMap.Polygon({
            map: map,
            strokeWeight: 1,
            strokeColor: "#0048ff",
            fillColor: "#99fbd2",
            fillOpacity: 0.5,
            path: bounds[i]
          });
          polygons.push(polygon);
        }
        map.setFitView(); // 地图自适应
      }
      let subList = data.districtList;
      if (data.level === "country") {
        // this.selectArr = subList;
        subList.forEach(key => {
          this.selectArr.push(key);
        });
      }
      if (this.limit) {
        setTimeout(() => {
          map.setLimitBounds(map.getBounds());
        }, 300);
      }
      // map.setFitView(); // 地图自适应
    },
    // 检查是否已经设置了区域设置
    getLimitBounds() {
      let limitBounds = map.getLimitBounds();
      if (limitBounds) {
        return true;
      }
      return false;
    },
    selectChange() {
      this.limit = true;
      // 先获取一下是否已经设置了区域限制，如果设置了 就先清除掉
      if (this.getLimitBounds()) {
        map.clearLimitBounds();
      }
      for (let i = 0, l = polygons.length; i < l; i++) {
        polygons[i].setMap(null);
      }
      district.setLevel("province");
      district.setExtensions("all");
      district.search(this.defaultOption, (status, result) => {
        if (status === "complete") {
          this.getCityData(result.districtList[0]);
        }
      });
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
          clickable: true,
          map: map
        });
        this.markers.push(marker);
      });
    },
    /*
      http请求 获取全部电池设备
     */
    narmleHttp(ws) {
      let pageObj = {
        pageNum: 1,
        pageSize: 999999999,
        bindingStatus: ''
      };
      GetDeviceList(pageObj)
        .then(res => {
          console.log(res);
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
            let result = res.data.data.data;
            this.allDevice = result.length;
            pointerObj = {};
            if (result.length > 0) {
              result.forEach(key => {
                if (key.longitude && key.latitude && key.onlineStatus === 1) {
                  pointerObj[key.deviceId] = `${key.longitude},${key.latitude}`;
                  this.sendData.param.push(key.deviceId);
                }
              });
              this.mapInit(pointerObj);
              setTimeout(() => {
                if (ws && ws.readyState === 1) {
                  ws.send(JSON.stringify(this.sendData));
                }
              }, 1000);
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
    /*
      websockets 请求
     */
    sockets() {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          this.narmleHttp(ws);
        };
        ws.onmessage = evt => {
          let data = JSON.parse(evt.data);
          console.log(data);
          if (data.code === 1) {
            this.onLine = data.data;
            if (Number(this.allDevice) < Number(this.onLine)) {
              this.onLine = this.allDevice;
            }
            this.offLine = this.allDevice - this.onLine;
          }
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
          onError("服务器繁忙，请稍后重试");
          this.over();
        };
        this.over = () => {
          ws.close();
        };
      });
    },
    init() {
      map = new AMap.Map("container", {
        resizeEnable: true,
        zoom: 10
      });
      AMap.service("AMap.DistrictSearch", () => {
        district = new AMap.DistrictSearch({
          subdistrict: 1,
          showbiz: false,
          level: "province"
        });
        district.search("中国", (status, result) => {
          if (status === "complete") {
            let data = result.districtList[0];
            this.getCityData(data);
          }
        });
      });
      this.sockets();
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    map.destroy();
    this.over();
  }
};
</script>
<style lang="scss" scoped>
@import url('../../common/style/index.scss');
.warrp {
  width: 100%;
  height: 100%;
  .mapWarrp {
    position: absolute;
    top: px2rem(60px);
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
