<template>
  <div class="login_page fillcontain">
    <div class="logo">
      <img src="../../../static/img/logo.png" alt="">
    </div>
    <section class="form_contianer">
      <div class="manage_tip">
        <p>{{projectName}}</p>
      </div>
      <div class="form">
        <div class="account">
          <mt-field type="text" label="账户" placeholder="请输入账户" v-model="loginForm.userName" :state="accountTip"></mt-field>
        </div>
        <div class="pwd">
          <mt-field type="password" label="密码" placeholder="请输入密码" v-model="loginForm.password" :state="pwdTip"></mt-field>
        </div>
        <div class="rem">
        </div>
        <div class="buttom">
          <!-- <button>登录</button> -->
          <!-- <a class="abtns" @click="submitForm" href="javascript:;">登录</a> -->
          <mt-button class="btns" type="primary" size='small' @click="submitForm">登录</mt-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { Field, MessageBox } from "mint-ui";
import { getAdminInfo } from "../../api/index";
import { onError } from "../../utils/callback";

export default {
  components: {
    "mt-field": Field
  },
  data() {
    return {
      accounts: [],
      pwd: false,
      accountTip: "",
      pwdTip: "",
      projectName: "电池后台管理系统",
      RMaccount: "记住账户",
      RMpassword: "记住密码",
      login: "登录",
      loginForm: {
        userName: "",
        password: ""
      },
      showLogin: false
    };
  },
  methods: {
    submitForm() {
      if (!this.loginForm.userName) {
        this.accountTip = "error";
        onError("请输入账户");
        return;
      }
      if (!this.loginForm.password) {
        this.pwdTip = "error";
        onError("请输入密码");
        return;
      }
      this.accountTip = "success";
      this.pwdTip = "success";
      this.loginFun();
    },
    loginFun() {
      getAdminInfo(this.loginForm)
        .then(res => {
          if (res.data.code === 0) {
            if (typeof sessionStorage === "object") {
              try {
                sessionStorage.setItem(
                  "loginData",
                  JSON.stringify(res.data.data)
                );
                sessionStorage.setItem("account", this.loginForm.userName);
                sessionStorage.setItem("password", this.loginForm.password);
                // sessionStorage.setItem('projectTit', '设备概览');
                this.$store.commit('LogInDate', res.data.data);
                this.$router.push("/home");
              } catch (error) {
                MessageBox('提示', '请关闭无痕模式后，在访问');
              }
            }
          } else {
            onError("请输入正确的用户名密码");
          }
        })
        .catch(error => {
          console.log(error);
          onError(error);
        });
    },
    init() {
      let account = sessionStorage.getItem("account");
      let pwd = sessionStorage.getItem("password");
      if (account) {
        this.loginForm.userName = account;
        // this.pwd = true;
      }
      if (pwd) {
        this.loginForm.password = pwd;
        // this.account = true;
      }
      // setTimeout(() => {
      //   this.showLogin = true;
      // }, 300);
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
// @import "../../common/style/index.scss";
.login_page {
  position: relative;
  height: 100%;
  background-color: #FFFFFF;
  .logo{
    text-align: center;
    margin: px2rem(50px);
    img {
      width: px2rem(160px);
      height: auto;
    }
  }
}

.form_contianer {
  width: px2rem(300px);
  margin: px2rem(30px) auto;
  // position: absolute;
  // top: 48%;
  // left: 50%;
  // // transform: translate(-50%,-50%);
  // margin-top: px2rem(-200px);
  // margin-left: px2rem(-150px);
  .manage_tip {
    p {
      font-size: px2rem(24px);
      color: #242f42;
      text-align: center;
      padding: px2rem(10px) 0 px2rem(20px);
    }
  }
}
.btns {
  width: 100%;
  text-align: center;
  cursor: pointer;
}
.abtns {
  margin: px2rem(30px) auto;
  font-size: px2rem(14px);
  display: block;
  height: 40px;
  line-height: 40px;
  width: 100%;
  text-align: center;
  cursor: pointer;
  background: #26a2ff;
  color: #ffffff;
}
</style>
