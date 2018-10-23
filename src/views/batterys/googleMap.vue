<template>
  <div id="containers" class="mapWarrps"></div>
</template>
<script>
/* eslint-disable */
import google from "google";
import { onError } from "../../utils/callback";

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
        this.markers.forEach(key => {
          key.setMap(null);
        });
        this.markers = [];
      }
      let allmarkerArr = Object.values(obj);
      let labelIndex = 1;
      allmarkerArr.forEach(key => {
        let lngs = key.toString().split(",");
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng(lngs[1], lngs[0]),
          label: `${labelIndex++}`,
          map: map
        });
        this.markers.push(marker);
      });
      if (type === "http") {
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
