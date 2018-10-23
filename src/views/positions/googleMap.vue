<template>
  <div id="containers" class="mapWarrps"></div>
</template>
<script>
/* eslint-disable */
import google from "google";
/* eslint-disable */
import jquery from "jquery";
import { onError, onTimeOut } from "../../utils/callback";

let map;
let ponterIndex;
export default {
  props: {
    propData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      markers: [],
      markerTime: [],
      hasGet: false
    };
  },
  watch: {
    propData: {
      handler: function(val) {
        console.log("val.data", val);
        this.mapInit(val, val.type);
      },
      deep: true
    }
  },
  mounted() {
    // console.log(jquery);
    this.init();
  },
  methods: {
    mapInit(value, fromWs) {
      if (this.markers.length > 0) {
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      let data = value.data;
      // if (this.hasGet) {
      //   map.setCenter(new google.maps.LatLng(key.latitude, key.longitude));
      // } else {
      //   this.hasGet = true;
      // }
      let allmarkerArr = Object.values(data);
      let markerkeys = Object.keys(data);
      this.markerTime = [];
      for (let i = 0; i < allmarkerArr.length; i++) {
        var lngs = allmarkerArr[i].toString().split(",");
        if (lngs[0].length > 6 && lngs[1].length > 6 && lngs[4] === "1") {
          let obj = {};
          var latLng = new google.maps.LatLng(lngs[0], lngs[1]);
          var marker = new google.maps.Marker({
            position: latLng,
            label: `${i + 1}`,
            title: `电池编号：${lngs[3]}\n设备编号：${markerkeys[i]}`,
            map: map
          });
          // map.setCenter(latLng);
          if (fromWs === "fromClick") {
            map.setCenter(latLng);
            marker.setLabel({
              text: `${value.ponterIndex}`
            });
          }
          obj.pointer = marker;
          obj.datas = lngs;
          obj.deviceCode = markerkeys[i];
          this.markerTime.push(obj);
          this.markers.push(marker);
        }
      }
      this.markerTime.forEach(key => {
        key.pointer.addListener("click", e => {
          var latLngData =
            e.latLng.lat().toFixed(6) + "," + e.latLng.lng().toFixed(6);
          jquery.ajax({
            type: "post",
            url:
              "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
              latLngData +
              "&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC8IXpNgfA7uD-Xb0jEqhkEdB7j3gbgOiE",
            async: true,
            success: function(data) {
              let address;
              if (data.status === "OK") {
                address = data.results[0].formatted_address;
              } else {
                address = "地址获取失败";
              }
              let site = `电池编号：${key.datas[3]}<br />设备编号：${
                key.deviceCode
              }<br />时间：${
                key.datas[2]
              }<br />坐标：${latLngData}<br />地址：${address}`;
              this.infowindow = new google.maps.InfoWindow({
                content: site
              });
              this.infowindow.open(map, key.pointer); // 弹出信息提示窗口
              map.addListener("click", () => {
                this.infowindow.close();
              });
            }
          });
        });
      });
      // 只有从概览中获取marker点的时候 才需要自适应显示；
      if (!fromWs) {
        // 地图自适应显示所有点
        let bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < this.markers.length; i++) {
          bounds.extend(this.markers[i].getPosition());
        }
        map.fitBounds(bounds);
      }
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
        this.hasGet = false;
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
