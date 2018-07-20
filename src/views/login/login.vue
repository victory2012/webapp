<template>
  <div class="login_page fillcontain">
    <transition name="form-fade" mode="in-out">
      <section class="form_contianer" v-show="showLogin">
        <div class="manage_tip">
          <p>{{projectName}}</p>
        </div>
        <el-form class="warrp" :model="loginForm" :rules="rules" ref="loginForm">
          <el-form-item prop="userName">
            <el-input v-model="loginForm.userName" size="small" placeholder="用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <!-- <input type="text" placeholder="密码" v-model="loginForm.password" @keyup.enter="submitForm('loginForm')"> -->
            <el-input type="password" placeholder="密码" size="small" v-model="loginForm.password" @keyup.enter.native="submitForm('loginForm')"></el-input>
          </el-form-item>
          <el-checkbox style="float:left" v-model="account">{{RMaccount}}</el-checkbox>
          <el-checkbox style="float:right" v-model="pwd">{{RMpassword}}</el-checkbox>
          <el-button type="primary" @click="submitForm('loginForm')" :loading="isLogin" class="submit_btn">{{login}}</el-button>
          <!-- <el-form-item prop="checkBox">
            <el-checkbox style="float:left" v-model="account">{{RMaccount}}</el-checkbox>
            <el-checkbox style="float:right" v-model="pwd">{{RMpassword}}</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('loginForm')" :loading="isLogin" class="submit_btn">{{login}}</el-button>
          </el-form-item> -->
        </el-form>
      </section>
    </transition>
  </div>
</template>

<script>
import { getAdminInfo } from "../../api/index";

export default {
  data() {
    return {
      account: false,
      pwd: false,
      isLogin: false,
      projectName: "电池后台管理系统",
      RMaccount: "记住账户",
      RMpassword: "记住密码",
      login: "登录",
      loginForm: {
        userName: "",
        password: ""
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      showLogin: false
    };
  },
  methods: {
    submitForm(params) {
      this.$refs[params].validate(valid => {
        if (valid) {
          this.isLogin = true;
          getAdminInfo(this.loginForm)
            .then(res => {
              this.isLogin = false;
              console.log(res);
              if (res.data.code === 0) {
                localStorage.setItem(
                  "loginData",
                  JSON.stringify(res.data.data)
                );
                localStorage.setItem("account", this.loginForm.userName);
                localStorage.setItem("password", this.loginForm.password);
                this.$router.push("/home");
              } else {
                this.$notify.error({
                  title: "错误",
                  message: "请输入正确的用户名密码",
                  offset: 100
                });
              }
            })
            .catch(error => {
              console.log(error);
              this.isLogin = false;
              this.$message.error("服务器请求超时，请稍后重试");
            });
        }
      });
    },
    init() {
      let account = localStorage.getItem("account");
      let pwd = localStorage.getItem("password");
      if (account) {
        this.loginForm.userName = account;
        this.pwd = true;
      }
      if (pwd) {
        this.loginForm.password = pwd;
        this.account = true;
      }
      setTimeout(() => {
        this.showLogin = true;
      }, 300);
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
@import "../../common/style/index.scss";
.login_page {
  position: relative;
  height: 100%;
  background-color: #324057;
  .login-head {
    position: absolute;
    height: 70px;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #242f42;
    color: #ffffff;
    line-height: 70px;
    text-align: right;
    padding-right: 70px;
  }
}
.el-dropdown {
  color: #ffffff;
}
.el-form-item__content {
  display: flex;
  justify-content: space-between;
}

.form_contianer {
  width: px2rem(300px);
  position: absolute;
  top: 45%;
  left: 50%;
  // transform: translate(-50%,-50%);
  margin-top: px2rem(-200px);
  margin-left: px2rem(-150px);
  text-align: center;
  .manage_tip {
    p {
      font-size: px2rem(28px);
      color: #fff;
    }
  }
  .warrp {
    padding: px2rem(20px);
    background-color: #fff;
    border-radius: 3px;
    .el-form-item {
      margin-bottom: px2rem(18px);
    }
    .submit_btn {
      width: 100%;
      font-size: px2rem(16px);
      padding: px2rem(8px);
    }
  }
}
.tip {
  font-size: 12px;
  color: red;
}
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 1s;
}
.form-fade-enter,
.form-fade-leave-active {
  transform: translate3d(0, -50px, 0);
  opacity: 0;
}
</style>
