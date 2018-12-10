<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">{{$t('device.serial')}}</li>
        <li class="device">{{$t('device.deviceCode')}}</li>
        <li>{{$t('device.bindStatus')}}</li>
        <li>{{$t('device.runStatus')}}</li>
        <li class="index">{{$t('device.detail')}}</li>
      </ul>
    </div>
    <div class="tableBody"
      ref="wrapper"
      :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom"
        :auto-fill="false"
        @bottom-status-change="handleBottomChange"
        :bottom-all-loaded="allLoaded"
        ref="loadmore">
        <ul>
          <li v-for=" (key, index) in tableData"
            :key="key.deviceId">
            <div class="index">{{index +1}}</div>
            <div class="device">{{key.deviceId}}</div>
            <div>{{key.bindingName}}</div>
            <div>{{key.online}}</div>
            <div class="blueColor index"
              @click="toLookDetail(key)">{{$t('device.detail')}}</div>
          </li>
        </ul>
        <div slot="bottom"
          class="mint-loadmore-bottom">
          <span v-show="bottomStatus !== 'loading'"
            :class="{ 'is-rotate': bottomStatus === 'drop' }">↑</span>
          <span v-show="bottomStatus === 'loading'">
            <mt-spinner type="snake"></mt-spinner>
          </span>
        </div>
      </mt-loadmore>
    </div>
    <mt-popup v-model="showIt"
      popup-transition="popup-fade">
      <div class="table">
        <div class="header">
          {{$t('device.deviceDetail')}}
        </div>
        <div class="info">
          <ul>
            <li>
              <div>{{$t('device.deviceCode')}}</div>
              <div class="cons">{{detailObj.deviceId}}</div>
            </li>
            <li>
              <div>{{$t('device.manufacturerName')}}</div>
              <div class="cons">{{detailObj.manufacturerName}}</div>
            </li>
            <li>
              <div>{{$t('device.createTime')}}</div>
              <div class="cons">{{detailObj.createTime}}</div>
            </li>
            <li>
              <div>{{$t('device.bindStatus')}}</div>
              <div class="cons">{{detailObj.bindingName}}</div>
            </li>
            <li>
              <div>{{$t('device.batteryCode')}}</div>
              <div class="cons">{{detailObj.batteryId}}</div>
            </li>
            <li>
              <div>{{$t('device.onlineStatus')}}</div>
              <div class="cons">{{detailObj.online}}</div>
            </li>
            <li>
              <div>{{$t('device.device')}}</div>
              <div class="cons">
                <mt-button @click="LookRun"
                  size="small"
                  :disabled="detailObj.onlineStatus === 0"
                  :type="detailObj.onlineStatus === 0?'default':'primary'">{{$t('device.location')}}</mt-button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </mt-popup>
    <div class="pb"
      @click="ToaddDevice">{{$t('device.addDevice')}}</div>
    <!-- <mt-palette-button content="添加设备" @expand="main_log('expand')" @expanded="main_log('expanded')"
      class="pb" :radius="80" ref="target_1" mainButtonStyle="color:#fff;background-color:#26a2ff;font-size: 12px;">
      <div class="my-icon-button">1</div>
      <div class="my-icon-button">2</div>
    </mt-palette-button> -->
  </div>
</template>
<script>
import { Loadmore, Spinner, Popup, Indicator } from "mint-ui";
import {
  deviceList,
  // createDeviceList,
  enterpriseList,
  enterpriseCustomer
} from "../../api/index";
import { getStorage } from "../../utils/transition";

export default {
  components: {
    "mt-spinner": Spinner,
    "mt-loadmore": Loadmore,
    "mt-popup": Popup
  },
  data () {
    return {
      pageNum: 1,
      showIt: false,
      detailObj: {},
      tableData: [],
      allLoaded: false,
      manufacturerOptions: [],
      totalPage: Number,
      wrapperHeight: 0,
      bottomStatus: "",
      customerOptions: []
    };
  },
  mounted () {
    this.wrapperHeight =
      document.documentElement.clientHeight -
      this.$refs.wrapper.getBoundingClientRect().top;
    this.getData();
  },
  methods: {
    handleBottomChange (status) {
      this.bottomStatus = status;
    },
    loadBottom () {
      this.pageNum++;
      setTimeout(() => {
        this.getData();
      }, 1000);
    },
    getData () {
      Indicator.open();
      let pageObj = {
        pageSize: 15,
        pageNum: this.pageNum
      };
      deviceList(pageObj).then(res => {
        let result = res.data;
        Indicator.close();
        console.log(result);
        this.bottomStatus = "";

        if (result.code === 0) {
          if (result.data.data) {
            let tableObj = result.data.data;
            if (tableObj.length < 15) {
              this.allLoaded = true;
            }
            this.totalPage = result.data.total;
            this.tableData = [];
            tableObj.forEach(key => {
              // let resultTime = key.createTime;
              if (key.bindingStatus === 0) {
                key.bindingName = this.$t("device.nobind");
              } else {
                key.bindingName = this.$t("device.hasbind");
              }
              key.online = key.onlineStatus === 0 ? this.$t("device.offline") : this.$t("device.online");
              // key.createTime = timeFormats(resultTime);
              // key.createTimea = timeFormats(resultTime);
              key.status = key.status === 0 ? true : false;
              this.tableData.push(key);
            });
          }
        }
      });
    },
    getAddData () {
      // 生产企业列表
      enterpriseList().then(res => {
        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          result.forEach(key => {
            this.manufacturerOptions.push(key);
          });
        }
      });
      enterpriseCustomer()
        // 客户企业列表
        .then(res => {
          if (res.data && res.data.code === 0) {
            let data = res.data.data;
            data.forEach(key => {
              this.customerOptions.push(key);
            });
          }
        });
    },
    toLookDetail (key) {
      console.log(key);
      this.detailObj = key;
      this.showIt = true;
    },
    LookRun () {
      let userData = JSON.parse(getStorage("loginData"));
      let deviceId = this.detailObj.deviceId;
      if (this.detailObj.onlineStatus === 1) {
        // this.$router.push({
        //   path: "googlePos",
        //   query: { deviceId: deviceId }
        // });
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
    },
    ToaddDevice () {
      // console.log(str);
      this.$router.push("addevice");
    }
  }
};
</script>
<style lang="scss" scoped>
@import url('../../common/style/index.scss');
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
    padding: 0 10px;
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
        font-size: 10px;
        &.device {
          flex: 0 0 px2rem(108px);
        }
        &.index {
          flex: 0 0 px2rem(32px);
        }
      }
    }
  }
  .tableBody {
    padding: 40px 10px 80px 10px;
    ul {
      overflow: auto;
      li {
        display: flex;
        width: 100%;
        border-bottom: 1px dashed #e0e0e0;
        // overflow: scroll;
        div {
          height: 45px;
          line-height: 45px;
          flex: 1;
          text-align: center;
          color: rgb(96, 98, 102);
          &.index {
            flex: 0 0 px2rem(32px);
          }
          &.device {
            flex: 0 0 px2rem(108px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
  .pb {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    color: #fff;
    background-color: #26a2ff;
    font-size: px2rem($tableFont);
    text-align: center;
    line-height: 56px;
    .mint-main-button {
      font-size: px2rem(12px);
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
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
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
          flex: 0 0 px2rem(150px);
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
