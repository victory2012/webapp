<template>
  <div class="warrp">
    <div class="Statistics">
      <ul>
        <li>
          <div class="icon blue">
            <i class="iconfont icon-suoyoushangpin2"></i>
          </div>
          <div>{{$t('overview.total')}}:
            <span style="color:rgb(45, 140, 240)">{{count.total}}</span>
          </div>
        </li>
        <li>
          <div class="icon green">
            <i class="iconfont icon-onlinepay"></i>
          </div>
          <div>{{$t('overview.online')}}:
            <span style="color:rgb(100, 213, 114)">{{count.monthTotal}}</span>
          </div>
        </li>
      </ul>
      <ul>
        <li>
          <div class="icon red">
            <i class="iconfont icon-offline"></i>
          </div>
          <div>{{$t('overview.offLine')}}:
            <span style="color:rgb(242, 94, 67)">{{count.availableTotal}}</span>
          </div>
        </li>
        <li>
          <div class="icon yellow">
            <i class="iconfont icon-alarm"></i>
          </div>
          <div>{{$t('overview.invalid')}}:
            <span style="color:#999">{{count.invalid}}</span>
          </div>
        </li>
      </ul>
    </div>
    <!-- <component :is="mapType" :propData="mapData"></component> -->
    <gaodao-map v-if="GETMAPTYPE == 0" :propData="mapData"></gaodao-map>
    <google-map v-if="GETMAPTYPE == 1" :propData="mapData"></google-map>
  </div>
</template>
<script>
// import { mapGetters } from "vuex";
import { Indicator } from "mint-ui";
import { websockets, GetDeviceList, GetCount } from "../../api/index";
import { onError, onWarn } from "../../utils/callback";
import gaodaoMap from "./gaodeMap";
import googleMap from "./googleMap";

let pointerObj = {};
let wsTimer;
export default {
  name: "battery",
  components: {
    gaodaoMap,
    googleMap
  },
  data() {
    return {
      count: {},
      mapData: {},
      lnglats: [],
      onLine: 0,
      allDevice: 0,
      limit: false,
      offLine: 0,
      markers: [],
      GETMAPTYPE: "",
      sendData: { api: "bind", param: [] }
    };
  },
  // computed: {
  //   ...mapGetters(["GETMAPTYPE"])
  // },
  methods: {
    /* 获取统计数据 */
    getTocalsData() {
      GetCount().then(res => {
        console.log("GetCount", res);
        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          this.count = result;
          this.count.invalid =
            Number(result.total) - Number(result.availableTotal);
        }
      });
    },
    /*
      http请求 获取全部电池设备
     */
    narmleHttp() {
      let pageObj = {
        pageNum: 1,
        pageSize: 999999999,
        bindingStatus: ""
      };
      Indicator.open();
      GetDeviceList(pageObj).then(res => {
        console.log(res);
        Indicator.close();

        if (res.data && res.data.code === 0) {
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
            this.mapData = {
              data: pointerObj,
              type: "http"
            };
            this.sockets(JSON.stringify(this.sendData));
          } else {
            onWarn("暂无设备, 请先注册设备");
          }
        }
      });
    },
    /*
      websockets 请求
     */
    sockets(datas) {
      websockets(ws => {
        ws.onopen = () => {
          console.log("open....");
          ws.send(datas);
          wsTimer = setInterval(() => {
            ws.send(JSON.stringify({ api: "heart" }));
          }, 60000);
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
            // code 为 1时 既绑定成功，2时为 收到了数据
            let obj = data.data.split(",");
            obj.forEach(() => {
              pointerObj[obj[0]] = `${obj[2]},${obj[1]}`;
            });
            this.mapData = {
              data: pointerObj,
              type: "ws"
            };
            // this.mapInit(pointerObj);
          }
        };
        ws.onerror = () => {
          wsTimer && clearInterval(wsTimer);
          onError("服务器繁忙，请稍后重试");
          this.over();
        };
        ws.onclose = () => {
          console.log("closed...");
        };
        this.over = () => {
          ws.close();
        };
      });
    },
    init() {
      this.getTocalsData();
      this.narmleHttp();
    }
  },
  mounted() {
    this.GETMAPTYPE = localStorage.getItem("mapType");
    this.init();
  },
  beforeDestroy() {
    this.over();
    wsTimer && clearInterval(wsTimer);
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.warrp {
  position: absolute;
  top: $baseHeader;
  right: 0;
  bottom: 0;
  left: 0;
  // .mapWarrp {
  //   width: 100%;
  //   height: 100%;
  // }
  .Statistics {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    background: #ffffff;
    ul {
      display: flex;
      padding: px2rem(10px);
      justify-content: space-between;
      // border-bottom: 1px solid #f0f0f0;
      li {
        font-size: px2rem(13px);
        line-height: px2rem(35px);
        flex: 0 0 48%;
        // flex: 1;
        // margin-right: 20px;
        display: flex;
        border: 1px solid #f0f0f0;
        border-radius: 3px;
        div {
          flex: 1;
          padding-left: px2rem(2px);
          color: #5a5a5a;
          &.icon {
            text-align: center;
            flex: 0 0 px2rem(35px);
            height: px2rem(35px);
          }
          &.blue {
            background: rgb(45, 140, 240);
            color: #ffffff;
          }
          &.green {
            background: rgb(100, 213, 114);
            color: #ffffff;
          }
          &.red {
            background: rgb(242, 94, 67);
            color: #ffffff;
          }
          &.yellow {
            background: #e6a23c;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
