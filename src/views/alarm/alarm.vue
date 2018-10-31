<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">{{$t('alarmList.serial')}}</li>
        <li class="times">{{$t('alarmList.time')}}</li>
        <li>{{$t('alarmList.batteryCode')}}</li>
        <li class="devices">{{$t('alarmList.content')}}</li>
        <li class="index">{{$t('alarmList.handle')}}</li>
      </ul>
    </div>
    <div class="tableBody" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom" :auto-fill="false" :bottomDistance='40' @bottom-status-change="handleBottomChange" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul class="page-loadmore-list">
          <li v-for=" (key, index) in tableData" :key="key.id">
            <div class="index">{{index +1}}</div>
            <div class="times">
              <p>{{key.hhmmss}}</p>
              <p>{{key.yymmdd}}</p>
            </div>
            <div>{{key.batteryId}}</div>
            <div class="devices">{{key.content}}</div>
            <div @click="Details(key)" class="blueColor index">{{$t('alarmList.detail')}}</div>
          </li>
        </ul>
        <div slot="bottom" class="mint-loadmore-bottom">
          <span v-show="bottomStatus === 'drop'" :class="{ 'is-rotate': bottomStatus === 'drop' }">↑</span>
          <span v-show="bottomStatus === 'loading'">
            <mt-spinner type="snake"></mt-spinner>
          </span>
        </div>
      </mt-loadmore>
    </div>
    <mt-popup v-model="showIt" popup-transition="popup-fade">
      <div class="table">
        <div class="header">
          {{$t('alarmList.batteryDetail')}}
        </div>
        <div class="info">
          <ul>
            <li>
              <div>{{$t('alarmList.batteryNumber')}}</div>
              <div class="cons">{{detailObj.batteryId}}</div>
            </li>
            <li>
              <div>{{$t('alarmList.deviceCode')}}</div>
              <div class="cons">{{detailObj.deviceId}}</div>
            </li>
            <li>
              <div>{{$t('alarmList.time')}}</div>
              <div class="cons">{{detailObj.alarmedTime}}</div>
            </li>
            <li>
              <div>{{$t('alarmList.content')}}</div>
              <div class="cons">{{detailObj.content}}</div>
            </li>
            <li>
              <div>{{$t('alarmList.grid')}}</div>
              <div class="cons">{{detailObj.grid}}</div>
            </li>
            <li>
              <div>{{$t('alarmList.position')}}</div>
              <div class="cons">
                <mt-button @click="alarmPos" size="small" type="primary">{{$t('alarmList.location')}}</mt-button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { Loadmore, Spinner, Popup, Indicator } from "mint-ui";
import { alarmList } from "../../api/index";
import { sortGps } from "../../utils/transition";
import { onError } from "../../utils/callback";

export default {
  components: {
    "mt-spinner": Spinner,
    "mt-loadmore": Loadmore,
    "mt-popup": Popup
  },
  data() {
    return {
      tableData: [],
      detailObj: {},
      showIt: false,
      allLoaded: false,
      bottomStatus: "",
      wrapperHeight: 0,
      pageNum: 1
    };
  },
  methods: {
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    loadBottom() {
      this.pageNum++;
      this.getData();
    },
    getData() {
      Indicator.open();
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 20
      };
      alarmList(pageObj).then(res => {
        console.log(res);
        Indicator.close();
        this.bottomStatus = "";

        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          this.totalNum = result.total;
          if (result.data.length > 0) {
            if (result.data.length < 20) {
              this.allLoaded = true;
            }
            result.data.forEach(key => {
              let obj = {};
              let resultTime = key.alarmedTime.toString().split(" ");
              // obj.last = timeFormats(resultTime);
              obj.alarmedTime = key.alarmedTime;
              obj.hhmmss = resultTime[1];
              obj.yymmdd = resultTime[0];
              obj.batteryId = key.batteryId; // 电池id
              obj.deviceId = key.deviceId; // 设备id
              obj.content = key.msg; // 告警内容
              obj.level = key.level; // 告警级别
              obj.grid = `${sortGps(key.longitude)};${sortGps(key.latitude)}`;
              this.tableData.push(obj);
            });
          } else {
            onError(`${this.$t("noData")}`);
          }
        }
      });
    },
    alarmPos() {
      // 查看位置

      const loginData = JSON.parse(localStorage.getItem("loginData"));
      if (loginData && loginData.mapType === 1) {
        this.$router.push({
          path: "gooAbno",
          query: {
            grid: this.detailObj.grid,
            deviceId: this.detailObj.deviceId
          }
        });
      } else {
        this.$router.push({
          path: "abnormal",
          query: {
            grid: this.detailObj.grid,
            deviceId: this.detailObj.deviceId
          }
        });
      }
    },
    Details(key) {
      this.showIt = true;
      this.detailObj = key;
    }
  },
  mounted() {
    this.wrapperHeight =
      document.documentElement.clientHeight -
      this.$refs.wrapper.getBoundingClientRect().top;
    this.getData();
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.battery {
  font-size: px2rem($tableFont);
  background: #fcfbfb;
  .tableHead {
    position: fixed;
    top: $baseHeader;
    left: 0;
    width: 100%;
    padding: 0 15px;
    border-bottom: 1px solid #e0e0e0;
    z-index: 10;
    background: #fcfbfb;
    ul {
      display: flex;
      li {
        font-weight: 500;
        height: 40px;
        line-height: 40px;
        flex: 1;
        text-align: center;
        color: #333;
        &.index {
          flex: 0 0 px2rem(32px);
        }
        &.times {
          flex: 0 0 px2rem(90px);
        }
        &.devices {
          flex: 0 0 px2rem(130px);
        }
      }
    }
  }
  .tableBody {
    // position: absolute;
    // top: 40px;
    // left: 0;
    // right: 0;
    padding: 40px 15px 0;
    overflow: scroll;
    li {
      display: flex;
      width: 100%;
      border-bottom: 1px dashed #e0e0e0;
      overflow: scroll;
      div {
        height: 45px;
        line-height: 45px;
        flex: 1;
        text-align: center;
        color: rgb(96, 98, 102);
        &.index {
          flex: 0 0 px2rem(32px);
        }
        &.blueColor {
          color: #385cd1;
        }
        &.redColor {
          color: #d43939;
          text-decoration: underline;
        }
        &.GreenColor {
          color: #3dd138;
          text-decoration: underline;
        }
        &.times {
          flex: 0 0 px2rem(90px);
          padding-top: px2rem(8px);
        }
        &.devices {
          font-size: px2rem(12px);
          flex: 0 0 px2rem(130px);
        }
        p {
          font-size: px2rem(12px);
          line-height: normal;
          // text-align: right;
        }
      }
    }
  }
}
.table {
  padding: px2rem(8px) px2rem(15px);
  position: absolute;
  width: px2rem(275px);
  height: auto;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 3px;
  // box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  .header {
    font-size: px2rem(16px);
    height: px2rem(30px);
    line-height: px2rem(30px);
    border-bottom: 1px dashed #e5e5e5;
    i {
      float: right;
      font-size: px2rem(14px);
    }
  }
  .info {
    li {
      font-size: px2rem($tableFont);
      height: px2rem(45px);
      display: flex;
      div {
        flex: 1;
        color: #494848;
        line-height: px2rem(45px);
        font-size: 13px;
        &.cons {
          flex: 0 0 px2rem(140px);
          color: #333;
          text-align: right;
        }
      }
    }
  }
}
.mint-loadmore-bottom span {
  display: inline-block;
  -webkit-transition: 0.2s linear;
  transition: 0.2s linear;
  vertical-align: middle;
}

.mint-loadmore-bottom span.is-rotate {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
}
</style>
