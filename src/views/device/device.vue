<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">序号</li>
        <li class="device">设备编号</li>
        <li>绑定电池</li>
        <li>在线状态</li>
        <li class="index">详情</li>
      </ul>
    </div>
    <div class="tableBody" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom" :auto-fill="false" @bottom-status-change="handleBottomChange" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul>
          <li v-for=" (key, index) in tableData" :key="key.deviceId">
            <div class="index">{{index +1}}</div>
            <div class="device">{{key.deviceId}}</div>
            <div>{{key.bindingName}}</div>
            <div>{{key.online}}</div>
            <div class="blueColor index" @click="toLookDetail(key)">详情</div>
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
    <div class="details" :class="[showIt ? 'showDetail': '']">
      <div class="table">
        <div class="header">
          设备详情
          <i @click="closeDetail" class="iconfont icon-close"></i>
        </div>
        <div class="info">
          <ul>
            <li>
              <div>设备编号</div>
              <div class="cons">{{detailObj.deviceId}}</div>
            </li>
            <li>
              <div>企业名称</div>
              <div class="cons">{{detailObj.manufacturerName}}</div>
            </li>
            <li>
              <div>创建时间</div>
              <div class="cons">{{detailObj.createTime}}</div>
            </li>
            <li>
              <div>电池绑定</div>
              <div class="cons">{{detailObj.bindingName}}</div>
            </li>
            <li>
              <div>电池编号</div>
              <div class="cons">{{detailObj.batteryId}}</div>
            </li>
            <li>
              <div>在线状态</div>
              <div class="cons">{{detailObj.online}}</div>
            </li>
            <li>
              <div>监测设备</div>
              <div class="cons">
                <mt-button @click="LookRun" size="small" type="primary">查看位置</mt-button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="pb" @click="ToaddDevice">添加设备</div>
    <!-- <mt-palette-button content="添加设备" @expand="main_log('expand')" @expanded="main_log('expanded')"
      class="pb" :radius="80" ref="target_1" mainButtonStyle="color:#fff;background-color:#26a2ff;font-size: 12px;">
      <div class="my-icon-button">1</div>
      <div class="my-icon-button">2</div>
    </mt-palette-button> -->
  </div>
</template>
<script>
import { Loadmore, Spinner } from "mint-ui";
import {
  deviceList,
  // createDeviceList,
  enterpriseList,
  enterpriseCustomer
} from "../../api/index";
import { timeFormats } from "../../utils/transition";
import { onTimeOut, onError } from "../../utils/callback";

export default {
  components: {
    "mt-spinner": Spinner,
    "mt-loadmore": Loadmore
  },
  data() {
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
        pageSize: 15,
        pageNum: this.pageNum
      };
      deviceList(pageObj).then(res => {
        let result = res.data;
        this.bottomStatus = '';
        if (result.code === 1) {
          onTimeOut(this.$router);
        }
        if (result.code === 0) {
          if (result.data.data) {
            let tableObj = result.data.data;
            if (tableObj.length < 15) {
              this.allLoaded = true;
            }
            this.totalPage = result.data.total;
            this.tableData = [];
            tableObj.forEach(key => {
              if (key.bindingStatus === 0) {
                key.bindingName = "未绑定";
              } else {
                key.bindingName = "已绑定";
              }
              key.online = key.onlineStatus === 0 ? "离线" : "在线";
              key.createTime = timeFormats(key.createTime);
              key.status = key.status === 0 ? true : false;
              this.tableData.push(key);
            });
          }
        }
        if (result.code === -1) {
          onError(result.msg);
        }
      });
    },
    getAddData() {
      // 生产企业列表
      enterpriseList().then(res => {
        if (res.data.code === 0) {
          let result = res.data.data;
          result.forEach(key => {
            this.manufacturerOptions.push(key);
          });
        }
      });
      enterpriseCustomer()
        // 客户企业列表
        .then(res => {
          if (res.data.code === 0) {
            let data = res.data.data;
            data.forEach(key => {
              this.customerOptions.push(key);
            });
          }
        });
    },
    toLookDetail(key) {
      console.log(key);
      this.detailObj = key;
      this.showIt = true;
    },
    closeDetail() {
      this.showIt = false;
    },
    LookRun() {
      let userData = JSON.parse(localStorage.getItem("loginData"));
      let deviceId = this.detailObj.deviceId;
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
    },
    ToaddDevice(str) {
      console.log(str);
      this.$router.push("addevice");
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
  font-size: px2rem(14px);
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
        height: 40px;
        line-height: 40px;
        flex: 1;
        text-align: center;
        color: #333;
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
    padding: 40px 15px 80px 15px;
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
  .details {
    position: fixed;
    top: $baseHeader;
    right: 0;
    bottom: 0;
    left: 0;
    // background: rgba($color: #000000, $alpha: 0.3);
    z-index: 99;
    opacity: 0;
    transition: all 0.3s ease-in;
    transform: scale(0);
    // display: none;
    &.showDetail {
      // display: block;
      transform: scale(1);
      opacity: 1;
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
          height: px2rem(45px);
          line-height: px2rem(45px);
          display: flex;
          div {
            flex: 1;
            color: #494848;
            &.cons {
              flex: 0 0 px2rem(160px);
              color: #333;
              text-align: right;
            }
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
    font-size: 12px;
    text-align: center;
    line-height: 56px;
    .mint-main-button {
      font-size: px2rem(12px);
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
