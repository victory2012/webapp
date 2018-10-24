<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">{{$t('batteryList.serial')}}</li>
        <li class="batteryid">{{$t('batteryList.batteryCode')}}</li>
        <li>{{$t('batteryList.binding')}}</li>
        <li>{{$t('batteryList.running')}}</li>
        <li class="index">{{$t('batteryList.detail')}}</li>
      </ul>
    </div>
    <div class="tableBody" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom" @bottom-status-change="handleBottomChange" :auto-fill="false" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul>
          <li v-for=" (key, index) in tableData" :key="key.id">
            <div class="index">{{index +1}}</div>
            <div class="batteryid">{{key.batteryId}}</div>
            <div>{{key.bindingName}}</div>
            <div @click="LookRun(key)" :class="[key.OLS ? 'GreenColor': 'redColor']">{{key.online}}</div>
            <div class="blueColor index" @click="toLookDetail(key)">{{$t('batteryList.detail')}}</div>
          </li>
        </ul>
        <div slot="bottom" class="mint-loadmore-bottom">
          <span v-show="bottomStatus !== 'loading'" :class="{ 'is-rotate': bottomStatus === 'drop' }">↑</span>
          <span v-show="bottomStatus === 'loading'">
            <mt-spinner type="snake"></mt-spinner>
          </span>
        </div>
      </mt-loadmore>
    </div>
    <mt-popup v-model="showIt" popup-transition="popup-fade">
      <div class="table">
        <div class="header">
          {{$t('batteryList.batteryDetail')}}
        </div>
        <div class="info">
          <ul>
            <li>
              <div>{{$t('batteryList.batteryNumber')}}</div>
              <div class="cons">{{detailObj.batteryId}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.model')}}</div>
              <div class="cons">{{detailObj.model}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.specif')}}</div>
              <div class="cons">{{detailObj.specification}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.customer')}}</div>
              <div class="cons">{{detailObj.customerName}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.deviceCode')}}</div>
              <div class="cons">{{detailObj.deviceId}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.bindStatus')}}</div>
              <div class="cons">{{detailObj.bindingName}}</div>
            </li>
            <li>
              <div>{{$t('batteryList.onlineStatus')}}</div>
              <div class="cons">{{detailObj.online}}</div>
            </li>
          </ul>
        </div>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { Loadmore, Spinner, Popup } from "mint-ui";
import {
  // addBattery,
  // deviceListOnly,
  GetList
  // deleteBattery
} from "../../api/index";
import { getStorage } from "../../utils/transition";

export default {
  components: {
    "mt-spinner": Spinner,
    "mt-loadmore": Loadmore,
    "mt-popup": Popup
  },
  data() {
    return {
      pageNum: 1,
      showIt: false,
      detailObj: {},
      tableData: [],
      allLoaded: false,
      loading: true,
      bottomStatus: "",
      wrapperHeight: 0,
      totalPage: Number
    };
  },
  mounted() {
    this.wrapperHeight =
      document.documentElement.clientHeight -
      this.$refs.wrapper.getBoundingClientRect().top;
    this.getData();
  },
  methods: {
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    loadBottom() {
      this.pageNum++;
      setTimeout(() => {
        this.getData();
      }, 1000);
    },
    getData() {
      let pageObj = {
        pageSize: 20,
        pageNum: this.pageNum
      };
      GetList(pageObj).then(res => {
        // this.loading = false;
        console.log(res);
        this.bottomStatus = "";
        let result = res.data;
        if (result.code === 0) {
          if (result.data.data) {
            let tableObj = result.data.data;
            this.totalPage = result.data.total;
            this.total = result.data.totalPage;
            if (tableObj.length < 20) {
              this.allLoaded = true;
            }
            tableObj.forEach(key => {
              if (key.onlineStatus === 1) {
                key.online = this.$t("batteryList.online");
                key.OLS = true;
              } else {
                key.online = this.$t("batteryList.offline");
                key.OLS = false;
              }
              key.bindingName =
                key.bindingStatus === 0
                  ? this.$t("batteryList.noBind")
                  : this.$t("batteryList.hasBind");
              // key.online = key.onlineStatus === 1 ? "离线" : "在线";
              key.status = key.status === 0 ? false : true;
              this.tableData.push(key);
            });
            this.loading = false;
          }
        }
      });
    },
    toLookDetail(key) {
      this.detailObj = key;
      this.showIt = true;
    },
    LookRun(key) {
      if (!key.OLS) return;
      let userData = JSON.parse(getStorage("loginData"));
      let deviceId = key.deviceId;
      if (userData.mapType === 0) {
        this.$router.push({
          path: "position",
          query: { deviceId: deviceId }
        });
      }
      if (userData.mapType === 1) {
        this.$router.push({
          path: "googlePos",
          query: { deviceId: deviceId }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.battery {
  position: absolute;
  top: $baseHeader;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: scroll;
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
        &.batteryid {
          flex: 0 0 px2rem(90px);
        }
        &.index {
          flex: 0 0 px2rem(32px);
        }
      }
    }
  }
  .tableBody {
    overflow: scroll;
    padding: 40px 15px 0 15px;
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
        &.batteryid {
          flex: 0 0 px2rem(90px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
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
    font-size: px2rem(14px);
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
      line-height: px2rem(45px);
      display: flex;
      div {
        flex: 1;
        color: #494848;
        &.cons {
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
