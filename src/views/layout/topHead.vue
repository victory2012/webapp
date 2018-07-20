<template>
  <div class="header">
    <div class="icon" @click="triggerList">
      <i class="iconfont icon-list"></i>
    </div>
    <div class="names">
      <el-dropdown class="user-name" trigger="click" @command="handleCommand">
        <span class="el-dropdown-link">
          {{username}}
          <i class="el-icon-caret-bottom"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="userMsg">
            <i class="iconfont icon-user"></i>个人信息</el-dropdown-item>
          <el-dropdown-item divided command="userPwd">
            <i class="el-icon-setting"></i>修改密码</el-dropdown-item>
          <el-dropdown-item divided command="loginout">
            <i class="iconfont icon-logout"></i>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
import bus from "../../utils/bus";

export default {
  data() {
    return {
      collapse: false
    };
  },
  computed: {
    username() {
      let userData = JSON.parse(localStorage.getItem("loginData"));
      return userData ? `${userData.enterpriseName}-${userData.userName}` : "";
    }
  },
  mounted() {
    bus.$on("collapsed", msg => {
      this.collapse = msg;
    });
  },
  methods: {
    handleCommand(command) {
      console.log(command);
      if (command === "loginout") {
        localStorage.removeItem("loginData");
        this.$router.push("/login");
      }
      if (command === "userMsg") {
        this.$router.push("/user");
      }
      if (command === "userPwd") {
        this.$router.push("/password");
      }
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
  height: px2rem(60px);
  line-height: px2rem(60px);
  border-bottom: 1px solid #cccccc;
  .icon {
    margin-left: px2rem(10px);
    width: px2rem(50px);
    .iconfont {
      font-size: px2rem(30px);
    }
  }
  .names {
    text-align: right;
    padding-right: px2rem(10px);
    font-size: px2rem(16px);
    width: px2rem(200px);
  }
}
</style>
