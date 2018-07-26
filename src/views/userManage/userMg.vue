<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">序号</li>
        <li>用户名</li>
        <li>账户身份</li>
        <li>企业身份</li>
        <li class="index">详情</li>
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
          用户详情
          <i @click="closeDetail" class="iconfont icon-close"></i>
        </div>
        <div class="info">
          <ul>
            <li>
              <div>用户名</div>
              <div class="cons">{{detailObj.userName}}</div>
            </li>
            <li>
              <div>账户身份</div>
              <div class="cons">{{detailObj.accountRole}}</div>
            </li>
            <li>
              <div>企业身份</div>
              <div class="cons">{{detailObj.enterpriseRole}}</div>
            </li>
            <li>
              <div>企业名称</div>
              <div class="cons">{{detailObj.enterpriseName}}</div>
            </li>
            <li>
              <div>手机号</div>
              <div class="cons">{{detailObj.phoneNumber}}</div>
            </li>
            <li>
              <div>邮箱</div>
              <div class="cons">{{detailObj.email}}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Loadmore, Spinner } from "mint-ui";
import { manufacturerList } from "../../api/index";
import { userRole, companyRole } from "../../utils/transition";
import { onTimeOut, onError } from "../../utils/callback";

export default {
  components: {
    "mt-loadmore": Loadmore,
    "mt-spinner": Spinner
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
      manufacturerList(pageObj)
        .then(res => {
          console.log(res);
          this.bottomStatus = '';
          let result = res.data;
          if (result.code === 1) {
            onTimeOut(this.$router);
          }
          if (result.code === -1) {
            onError(result.msg);
          }
          if (result.code === 0) {
            let tableObj = result.data.data;
            if (tableObj.length > 0) {
              this.totalPage = result.data.total;
              this.tableData = [];
              if (tableObj.length < 15) {
                this.allLoaded = true;
              }
              tableObj.forEach(key => {
                key.accountRole = userRole(key.userRole);
                key.status = key.status === 0 ? false : true;
                key.email = key.email || "无";
                key.phoneNumber = key.phoneNumber || "无";
                key.enterpriseRole = companyRole(key.enterpriseRole);
                this.tableData.push(key);
              });
            } else {
              onError("暂无数据");
            }
          }
        })
        .catch(() => {
          onError("服务器请求超时，请稍后重试");
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
              color: #333;
              text-align: right;
            }
          }
        }
      }
    }
  }
}
</style>
