<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">{{$t('useMsg.serial')}}</li>
        <li>{{$t('useMsg.name')}}</li>
        <li>{{$t('useMsg.accountIdentity')}}</li>
        <li>{{$t('useMsg.companyIdentity')}}</li>
        <li class="index">{{$t('useMsg.detail')}}</li>
      </ul>
    </div>
    <div class="tableBody" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom" @bottom-status-change="handleBottomChange" :auto-fill="false" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul>
          <li v-for=" (key, index) in tableData" :key="key.id">
            <div class="index">{{index +1}}</div>
            <div>{{key.userName}}</div>
            <div>{{key.accountRole}}</div>
            <div>{{key.enterpriseRole}}</div>
            <div class="blueColor index" @click="toLookDetail(key)">{{$t('useMsg.detail')}}</div>
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
          {{$t('useMsg.userDetail')}}
        </div>
        <div class="info">
          <ul>
            <li>
              <div>{{$t('useMsg.userName')}}</div>
              <div class="cons">{{detailObj.userName}}</div>
            </li>
            <li>
              <div>{{$t('useMsg.accountRole')}}</div>
              <div class="cons">{{detailObj.accountRole}}</div>
            </li>
            <li>
              <div>{{$t('useMsg.enterpriseRole')}}</div>
              <div class="cons">{{detailObj.enterpriseRole}}</div>
            </li>
            <li>
              <div>{{$t('useMsg.enterpriseName')}}</div>
              <div class="cons">{{detailObj.enterpriseName}}</div>
            </li>
            <li>
              <div>{{$t('useMsg.phone')}}</div>
              <div class="cons">{{detailObj.phoneNumber}}</div>
            </li>
            <li>
              <div>{{$t('useMsg.email')}}</div>
              <div class="cons">{{detailObj.email}}</div>
            </li>
          </ul>
        </div>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { Loadmore, Spinner, Popup, Indicator } from "mint-ui";
import { manufacturerList } from "../../api/index";
import { onError } from "../../utils/callback";

export default {
  components: {
    "mt-loadmore": Loadmore,
    "mt-spinner": Spinner,
    "mt-popup": Popup
  },
  data() {
    return {
      pageNum: 1,
      wrapperHeight: 0,
      showIt: false,
      detailObj: {},
      tableData: [],
      allLoaded: false,
      bottomStatus: "",
      totalPage: Number
    };
  },
  mounted() {
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
      Indicator.open();
      manufacturerList(pageObj)
        .then(res => {
          Indicator.close();
          console.log(res);
          this.bottomStatus = "";
          let result = res.data;

          if (result.code === 0) {
            let tableObj = result.data.data;
            if (tableObj.length > 0) {
              this.totalPage = result.data.total;
              this.tableData = [];
              if (tableObj.length < 15) {
                this.allLoaded = true;
              }
              tableObj.forEach(key => {
                key.accountRole = this.userRole(key.userRole);
                key.status = key.status === 0 ? false : true;
                key.email = key.email;
                key.phoneNumber = key.phoneNumber;
                key.enterpriseRole = this.companyRole(key.enterpriseRole);
                this.tableData.push(key);
              });
            } else {
              onError(`${this.$t("noData")}`);
            }
          }
        })
        .catch(() => {
          onError("服务器请求超时，请稍后重试");
        });
    },
    companyRole(str) {
      switch (str) {
        case "platform":
          return `${this.$t("platform")}`;
        case "manufacturer":
          return `${this.$t("manufacturer")}`;
        case "customer":
          return `${this.$t("customer")}`;
        default:
          return "";
      }
    },
    userRole(str) {
      switch (str) {
        case "plat_super_admin":
          return this.$t("useMsg.superAdministrator");
        case "super_admin":
          return this.$t("useMsg.superAdministrator");
        case "admin":
          return this.$t("useMsg.administrator");
        case "customer_super_admin":
          return this.$t("useMsg.administrator");
        case "manufacturer_super_admin":
          return this.$t("useMsg.administrator");
        default:
          return "";
      }
    },
    toLookDetail(key) {
      console.log(key);
      this.detailObj = key;
      this.showIt = true;
    },
    LookRun(key) {
      if (!key.OLS) return;
      let userData = JSON.parse(localStorage.getItem("loginData"));
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
    },
    main_log(str) {
      console.log(str);
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
        &.index {
          flex: 0 0 px2rem(32px);
        }
      }
    }
  }
  .tableBody {
    padding: 40px 15px 0 15px;
    .pb {
      position: fixed;
      bottom: 20px;
      left: 20px;
    }
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
          color: #333;
          text-align: right;
        }
      }
    }
  }
}
</style>
