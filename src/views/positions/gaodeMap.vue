<template>
  <div>
    <div id="positions" class="positioned"></div>
  </div>
</template>
<script>
/* eslint-disable */

import AMap from "AMap";
import AMapUI from "AMapUI";

let map;
let infoWindow;
export default {
  props: ["mapData"],
  data() {
    return {
      markers: []
    };
  },
  watch: {
    mapData: {
      handler: function(val) {
        this.MapInit(val.data, val.type);
      },
      deep: true
    }
  },
  methods: {
    init() {
      // const lang = localStorage.getItem("locale") === "EN" ? "en" : "zh_cn";
      map = new AMap.Map("positions", {
        resizeEnable: true,
        zoom: 15
      });
    },
    MapInit(data, type) {
      console.log(data);
      this.markers && map.remove(this.markers);
      let allmarkerArr = Object.values(data);
      let markerkeys = Object.keys(data);
      for (let i = 0; i < allmarkerArr.length; i++) {
        let lngs = allmarkerArr[i].toString().split(",");
        if (lngs[0].length > 6 && lngs[1].length > 6 && lngs[4] === "1") {
          let marker = new AMap.Marker({
            position: [lngs[0], lngs[1]],
            offset: new AMap.Pixel(-12, -12),
            zIndex: 101,
            extData: {
              position: `${lngs[0]},${lngs[1]}`,
              times: lngs[2]
            },
            map: map
          });
          if (lngs[5] === "0") {
            marker.setIcon("../../../static/img/gray.png");
          } else {
            marker.setIcon(
              `http://webapi.amap.com/theme/v1.3/markers/n/mark_b${i + 1}.png`
            );
          }
          if (type === "fromClick") {
            map.setCenter(new AMap.LngLat(lngs[0], lngs[1]));
            marker.setIcon(
              `http://webapi.amap.com/theme/v1.3/markers/n/mark_r${lngs[6]}.png`
            );
          }
          marker.setLabel({
            offset: new AMap.Pixel(15, 20),
            content: `${this.$t("positions.batteryCode")}：${
              lngs[3]
            }<br/>${this.$t("positions.deviceCode")}：${markerkeys[i]}`
          });
          this.markers.push(marker);
        }
      }
      if (type === "http") {
        map.setFitView(); // 自适应地图
      }
      if (this.markers.length > 0) {
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
          this.markers.forEach(key => {
            key.on("click", () => {
              let pointerData = key.getExtData();
              console.log(pointerData);
              let point = pointerData.position.split(",");
              let position = new AMap.LngLat(point[0], point[1]);
              positionPicker.start(position);
              positionPicker.on("success", result => {
                let info = [];
                info.push(
                  `<div><div>${this.$t("positions.updateTime")}：${
                    pointerData.times
                  }</div>`
                );
                info.push(
                  `<div style="font-size:14px;">${this.$t(
                    "positions.intersection"
                  )} :${result.nearestJunction}</div>`
                );
                info.push(
                  `<div style="font-size:14px;">${this.$t(
                    "positions.address"
                  )} :${result.address}</div></div>`
                );
                infoWindow = new AMap.InfoWindow({
                  content: info.join("<br/>"), // 使用默认信息窗体框样式，显示信息内容
                  autoMove: false,
                  offset: new AMap.Pixel(0, -10)
                });
                infoWindow.open(map, position);
              });
            });
            map.on("click", () => {
              infoWindow && infoWindow.close();
            });
          });
        });
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="less" scoped>
.positioned {
  width: 100%;
  height: calc(100vh - 40px);
}
</style>
