<template>
  <div class="header">
    <mt-header fixed :title="username">
      <mt-button @click="triggerList" slot="left">
        <i class="iconfont icon-list1"></i>
      </mt-button>
      <mt-button icon="more" @click="showMore" slot="right"></mt-button>
    </mt-header>
    <div class="userInfo" :class="[showIt ? 'showit' :'']">
      <ul>
        <li>
          <i class="iconfont icon-user"></i>
          <router-link to="/user">个人信息</router-link>
        </li>
        <li>
          <i class="iconfont icon-password"></i>
          <router-link to="/password">修改密码</router-link>
        </li>
        <li @click="handleCommand">
          <i class="iconfont icon-logout"></i>
          <span>退出登录</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import bus from "../../utils/bus";

export default {
  data() {
    return {
      showIt: false,
      collapse: false
    };
  },
  computed: {
    username() {
      // let userData = JSON.parse(localStorage.getItem("loginData"));
      let userData = JSON.parse(localStorage.getItem("loginData")) || this.$store.state.LogInDate;
      return userData ? `${userData.enterpriseName}-${userData.userName}` : "";
    }
  },
  mounted() {
    bus.$on("collapsed", msg => {
      this.collapse = msg;
    });
  },
  methods: {
    handleCommand() {
      localStorage.removeItem("loginData");
      this.$router.push("/login");
    },
    showMore() {
      this.showIt = !this.showIt;
    },
    triggerList() {
      this.collapse = !this.collapse;
      bus.$emit("collapse", this.collapse);
    }
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.header {
  display: flex;
  justify-content: space-between;
  height: $baseHeader;
  line-height: $baseHeader;
  border-bottom: 1px solid #cccccc;
  .iconfont {
    font-size: px2rem(24px);
  }
  .userInfo {
    position: absolute;
    top: ($baseHeader + 5px);
    right: 5px;
    width: px2rem(80px);
    height: 0;
    overflow: hidden;
    background: #ffffff;
    border-radius: 3px;
    z-index: 222;
    box-shadow: 0 0 15px #333333;
    transition: height 0.3s ease-in;
    &.showit {
      height: px2rem(120px);
    }
    li {
      font-size: px2rem(12px);
      height: px2rem(40px);
      line-height: px2rem(40px);
      text-align: center;
      border-bottom: 1px solid #e5e5e5;
      i {
        font-size: px2rem(14px);
      }
      a {
        color: #333333;
      }
    }
  }
}
</style>
