<template>
  <div id="containers" class="mapWarrps"></div>
</template>
<script>
/* eslint-disable */
import google from "google";
import jquery from "jquery";
import { onError } from "../../utils/callback";

let map;
let heatmapData;
let line;
let animate1;
let pointArr = [];
export default {
  props: {
    propData: {
      type: Array,
      default: () => []
    },
    control: {
      type: Object,
      default: () => {
        return {
          trajectory: false,
          active: true
        };
      }
    }
  },
  data() {
    return {
      trajectory: false,
      markers: [],
      markerPointer: {
        sdPointer: [],
        mapPointer: []
      },
      localMakerArr: [],
      active: true
    };
  },
  watch: {
    propData: {
      handler: function(val) {
        if (this.active) {
          this.heatmap(val);
        } else {
          this.track(val);
        }
      },
      deep: true
    },
    control: {
      handler: function(value) {
        if (value) {
        }
      },
      deep: true
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    // 历史轨迹 轨迹配置
    track(gridData) {
      this.trajectory = true;
      this.active = false;
      this.clearMap();
      line = new google.maps.Polyline({
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: "#1200ff"
            },
            offset: "0%"
          }
        ],
        strokeColor: "#71253e",
        map: map
      });
      line.setPath(gridData);
      // let TimerMax = Math.ceil(gridData.length * 0.01);
      // if (TimerMax > this.max) {
      //   this.max = Math.ceil(TimerMax * 2);
      // }
      // this.min = TimerMax;
      // this.timeSeconds = TimerMax;
      let start = new google.maps.Marker({
        position: gridData[0],
        label: {
          color: "#FFF",
          text: "S"
        },
        map: map
      });
      let end = new google.maps.Marker({
        position: gridData[gridData.length - 1],
        label: {
          color: "#FFF",
          text: "E"
        },
        map: map
      });
      this.markerPointer.sdPointer.push(start);
      this.markerPointer.sdPointer.push(end);
    },
    // 清除地图上的覆盖物
    clearMap() {
      animate1 && clearInterval(animate1);
      heatmapData && heatmapData.setMap(null);
      line && line.setMap(null);
      if (this.markerPointer.sdPointer.length > 0) {
        this.markerPointer.sdPointer.forEach(marker => {
          marker.setMap(null);
        });
        this.markerPointer.sdPointer = [];
      }
      if (this.markerPointer.mapPointer.length > 0) {
        this.markerPointer.mapPointer.forEach(marker => {
          marker.setMap(null);
        });
        this.markerPointer.mapPointer = [];
      }
      if (this.localMakerArr.length > 0) {
        this.localMakerArr.forEach(key => {
          key.setMap(null);
        });
      }
    },
    heatmap(gridData) {
      this.trajectory = false;
      this.active = true;
      this.clearMap();
      heatmapData = new google.maps.visualization.HeatmapLayer({
        data: gridData,
        map: map,
        radius: 10,
        opacity: 1,
        maxIntensity: 15,
        dissipating: true,
        gradient: [
          "rgba(0, 0, 255, 0)",
          "rgba(55, 55, 255, 1)",
          "rgba(0, 255, 120, 1)",
          "rgba(18, 255, 0, 1)",
          "rgba(150, 255, 0, 1)",
          "rgba(210, 255, 0, 1)",
          "rgba(255, 228, 0, 1)",
          "rgba(255, 216, 0, 1)",
          "rgba(255, 132, 0, 1)",
          "rgba(255, 72, 0, 1)",
          "rgba(255, 48, 0, 1)",
          "rgba(234, 86, 61, 1)",
          "rgba(255, 36, 0, 1)",
          "rgba(255, 0, 0, 1)"
        ]
      });
      // heatmapData.set("gradient", gradient);
    },
    init() {
      try {
        map = new google.maps.Map(document.getElementById("containers"), {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 10
        });
        map.addListener("click", e => {
          if (this.localMakerArr.length > 0) {
            this.localMakerArr.forEach(key => {
              key.setMap(null);
            });
          }
          var latLngData =
            e.latLng.lat().toFixed(6) + "," + e.latLng.lng().toFixed(6);
          var localMaker = new google.maps.Marker({
            position: e.latLng,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 3,
              strokeColor: "red"
            },
            map: map
          });
          this.localMakerArr.push(localMaker);
          jquery.ajax({
            type: "post",
            url:
              "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
              latLngData +
              "&key=AIzaSyC8IXpNgfA7uD-Xb0jEqhkEdB7j3gbgOiE&fields=formatted_address",
            async: true,
            success: function(data) {
              console.log(data);
              var site =
                "坐标：" +
                latLngData +
                "<br />" +
                "地址：" +
                data.results[0].formatted_address;
              var infowindow = new google.maps.InfoWindow({
                content: site
              });
              infowindow.open(map, localMaker); // 弹出信息提示窗口
              map.addListener("click", () => {
                infowindow.close();
              });
            }
          });
        });
      } catch (err) {
        console.log(err);
        onError("地图加载失败，请检查网络连接");
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.mapWarrps {
  width: 100%;
  height: 100%;
}
</style>
