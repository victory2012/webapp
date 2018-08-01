<template>
  <div class="battery">
    <div class="tableHead">
      <ul>
        <li class="index">序号</li>
        <li class="times">告警内容</li>
        <li>电池编号</li>
        <li class="devices">设备编号</li>
        <li class="index">操作</li>
      </ul>
    </div>
    <div class="tableBody" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
      <mt-loadmore :bottom-method="loadBottom" :auto-fill="false" @bottom-status-change="handleBottomChange" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul class="page-loadmore-list">
          <li v-for=" (key, index) in tableData" :key="key.id">
            <div class="index">{{index +1}}</div>
            <div>
              {{key.content}}
            </div>
            <div>{{key.batteryId}}</div>
            <div class="devices">{{key.deviceId}}</div>
            <div @click="Details(key)" class="blueColor index">详情</div>
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
          电池详情
        </div>
        <div class="info">
          <ul>
            <li>
              <div>电池编号</div>
              <div class="cons">{{detailObj.batteryId}}</div>
            </li>
            <li>
              <div>设备编号</div>
              <div class="cons">{{detailObj.deviceId}}</div>
            </li>
            <li>
              <div>告警时间</div>
              <div class="cons">{{detailObj.startTime}}</div>
            </li>
            <li>
              <div>告警内容</div>
              <div class="cons">{{detailObj.content}}</div>
            </li>
            <li>
              <div>设备坐标</div>
              <div class="cons">{{detailObj.grid}}</div>
            </li>
            <li>
              <div>查看位置</div>
              <div class="cons">
                <mt-button @click="alarmPos" size="small" type="primary">查看告警位置</mt-button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { Loadmore, Spinner, Popup } from "mint-ui";
import { alarmList } from "../../api/index";
import { yymmdd, hhmmss, sortGps } from "../../utils/transition";
import { onTimeOut, onError } from "../../utils/callback";

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
      setTimeout(() => {
        this.getData();
      }, 1000);
    },
    getData() {
      let pageObj = {
        pageNum: this.pageNum,
        pageSize: 20
      };
      alarmList(pageObj)
        .then(res => {
          console.log(res);
          this.bottomStatus = "";
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
            let result = res.data.data;
            this.totalNum = result.total;
            if (result.data.length > 0) {
              if (result.data.length < 20) {
                this.allLoaded = true;
              }
              result.data.forEach(key => {
                let obj = {};
                obj.hhmmss = hhmmss(key.alarmedTime);
                obj.yymmdd = yymmdd(key.alarmedTime);
                obj.batteryId = key.batteryId; // 电池id
                obj.deviceId = key.deviceId; // 设备id
                obj.content = key.msg; // 告警内容
                obj.level = key.level; // 告警级别
                obj.grid = `${sortGps(key.longitude)};${sortGps(key.latitude)}`;
                this.tableData.push(obj);
              });
              // onErrors(new Date("2018\-07\-25T13:47:46.000+0000"));
            } else {
              onError("暂无数据");
            }
          }
          if (res.data.code === -1) {
            onError(res.data.msg);
          }
        })
        .catch(err => {
          console.log(err);
          onError("服务器请求超时，请稍后重试");
        });
    },
    alarmPos() {
      // 查看位置
      this.$router.push({
        path: "abnormal",
        query: { grid: this.detailObj.grid, deviceId: this.detailObj.deviceId }
      });
    },
    Details(key) {
      this.showIt = true;
      this.detailObj = key;
    },
    closed() {
      this.showIt = false;
      this.detailObj = {};
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
          flex: 0 0 px2rem(108px);
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
          flex: 0 0 px2rem(108px);
        }
        p {
          font-size: px2rem(12px);
          line-height: normal;
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
        &.cons {
          flex: 0 0 px2rem(160px);
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
