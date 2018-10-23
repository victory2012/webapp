<template>
  <div id="container" class="mapWarrp"></div>
</template>
<script>
/* eslint-disable */
import AMap from "AMap";
import { onTimeOut, onError, onWarn } from "../../utils/callback";
let map;
export default {
  props: {
    propData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      markers: []
    };
  },
  watch: {
    propData: {
      handler: function(val) {
        this.mapInit(val.data, val.type);
      },
      deep: true
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    mapInit(obj, type) {
      if (this.markers.length > 0) {
        map.remove(this.markers);
      }
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
      if (type === "http") {
        map.setFitView(); // 地图自适应
      }
    },
    init() {
      // const lang = localStorage.getItem("locale") === "EN" ? "en" : "zh_cn";
      map = new AMap.Map("container", {
        resizeEnable: true,
        zoom: 10
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.mapWarrp {
  width: 100%;
  height: 100%;
}
</style>
