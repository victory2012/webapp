<template>
  <div class="login_page fillcontain">
    <div @click="sheetVisible=true"
      class="languageWarp">
      <p class="languageCenter">{{localLanguge}}<i class="iconfont icon-icon11 more"></i></p>
    </div>
    <div class="logo">
      <img src="../../../static/img/logo.png"
        alt="">
    </div>
    <section class="form_contianer">
      <div class="manage_tip">
        <p>{{$t('loginMsg.projectName')}}</p>
      </div>
      <div class="form">
        <div class="account">
          <mt-field type="text"
            :label="$t('loginMsg.accountPlace')"
            :placeholder="$t('loginMsg.userNameMsg')"
            v-model="loginForm.userName"></mt-field>
        </div>
        <div class="pwd">
          <mt-field type="password"
            :label="$t('loginMsg.passwordPlace')"
            :placeholder="$t('loginMsg.password')"
            v-model="loginForm.password"></mt-field>
        </div>
        <div class="rem">
          <div>
            <input id="account"
              class="magic-checkbox"
              type="checkbox"
              v-model="accountVal" />
            <label for="account"
              class="my_protocol">{{$t('loginMsg.RMaccount')}}</label>
          </div>
          <div>
            <input id="pwd"
              class="magic-checkbox"
              type="checkbox"
              v-model="passwordVal" />
            <label for="pwd"
              class="my_protocol">{{$t('loginMsg.RMpassword')}}</label>
          </div>
        </div>
        <div class="buttom">
          <mt-button class="btns"
            type="primary"
            size='small'
            @click="submitForm">{{$t('loginMsg.loginBtn')}}</mt-button>
          <!-- <mt-button class="btns" type="primary" size='small' @click="changLocalLang">{{localLanguge}}</mt-button> -->
        </div>
      </div>
    </section>
    <mt-actionsheet :actions="actions"
      v-model="sheetVisible"
      cancelText="Cancel">
    </mt-actionsheet>
  </div>
</template>

<script>
import { Field, MessageBox, Actionsheet, Indicator } from "mint-ui";
import { getAdminInfo } from "@/api/index";
import { onError } from "@/utils/callback";
import { setStorage, getStorage } from "@/utils/transition";

export default {
  components: {
    "mt-field": Field,
    "mt-actionsheet": Actionsheet
  },
  data () {
    return {
      sheetVisible: false,
      accounts: [],
      actions: [
        { name: "中文", method: this.languageChange, id: "cn" },
        { name: "English", method: this.languageChange, id: "en" }
      ],
      pwd: false,
      accountVal: "",
      passwordVal: "",
      accountTip: "",
      pwdTip: "",
      value: "",
      loginForm: {
        userName: "",
        password: ""
      },
      localLanguge: "",
      showLogin: false
    };
  },
  created () {
    let locallanguage = localStorage.getItem("locale");
    // this.$i18n.locale = locallanguage || "CN";
    if (locallanguage) {
      this.localLanguge = locallanguage === "cn" ? "中文" : "English";
    } else {
      let currentLang = navigator.language; // 判断除IE外其他浏览器使用语言
      if (!currentLang) {
        // 判断浏览器使用语言
        currentLang = navigator.browserLanguage;
      }
      if (currentLang === "zh-CN") {
        this.localLanguge = "中文";
        setStorage("locale", "cn");
        this.$i18n.locale = "cn";
      } else {
        this.localLanguge = "English";
        setStorage("locale", "en");
        this.$i18n.locale = "en";
      }
    }
  },
  methods: {
    languageChange (str) {
      console.log("languageChange", str);
      if (str.id === "en") {
        this.$i18n.locale = "en";
        setStorage("locale", "en");
        this.localLanguge = "Language";
      } else {
        // this.langs = "en";
        this.localLanguge = "中文";
        this.$i18n.locale = "cn";
        setStorage("locale", "cn");
      }
    },
    submitForm () {
      if (!this.loginForm.userName) {
        this.accountTip = "error";
        onError(`${this.$t("loginMsg.errorMsg.account")}`);
        return;
      }
      if (!this.loginForm.password) {
        this.pwdTip = "error";
        onError(`${this.$t("loginMsg.errorMsg.password")}`);
        return;
      }
      this.accountTip = "success";
      this.pwdTip = "success";
      this.loginFun();
    },
    loginFun () {
      Indicator.open();
      getAdminInfo(this.loginForm).then(res => {
        Indicator.close();
        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          let Data = JSON.stringify(result);
          setStorage("loginData", Data);
          if (this.accountVal) {
            setStorage("account", this.loginForm.userName);
          }
          if (this.passwordVal) {
            setStorage("password", this.loginForm.password);
          }
          setStorage("mapType", result.mapType);
          this.$store.commit("LogInDate", Data);
          this.$store.commit('SetProjectName', this.$t("menu.overview"));
          this.$router.push("/home");
        }
      });
    },
    init () {
      if (typeof localStorage === "object") {
        try {
          let account = getStorage("account");
          let pwd = getStorage("password");
          if (account) {
            this.loginForm.userName = account;
            this.accountVal = true;
          }
          if (pwd) {
            this.loginForm.password = pwd;
            this.passwordVal = true;
          }
        } catch (error) {
          MessageBox(
            `${this.$t("loginMsg.tips")}`,
            `${this.$t("loginMsg.sortage")}`
          );
        }
      }
    }
  },
  mounted () {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
// @import "../../common/style/index.scss";
.login_page {
  position: relative;
  // height: 100%;
  background-color: #ffffff;
  .languageWarp {
    padding: 20px 40px;
    font-size: px2rem(14px);
    text-align: right;
  }
  .logo {
    text-align: center;
    padding: px2rem(20px) px2rem(40px);
    img {
      width: px2rem(160px);
      height: auto;
    }
  }
}
.rem {
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
}
.my_protocol {
  font-size: px2rem(14px);
}
.form_contianer {
  width: px2rem(300px);
  margin: 0 auto;
  .manage_tip {
    p {
      font-size: px2rem(18px);
      color: #242f42;
      font-weight: 700;
      text-align: center;
      padding: px2rem(10px) 10px px2rem(20px);
    }
  }
}
.my_protocol {
  height: 18px;
  vertical-align: middle;
  line-height: 18px;
}
.magic-checkbox + label {
  position: relative;
  display: block;
  padding-left: 22px;
  cursor: pointer;
  font-size: 13px;
  // vertical-align: middle;
}
.magic-checkbox + label:hover:before {
  animation-duration: 0.4s;
  animation-fill-mode: both;
  animation-name: hover-color;
}
.magic-checkbox + label:before {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  width: 16px;
  height: 16px;
  content: "";
  border: 1px solid #c0c0c0;
}
.magic-checkbox + label:after {
  position: absolute;
  display: none;
  content: "";
}

.magic-checkbox + label:before {
  border-radius: 3px;
}

.magic-checkbox + label:after {
  top: 1px;
  left: 5px;
  box-sizing: border-box;
  width: 6px;
  height: 10px;
  transform: rotate(45deg);
  border-width: 2px;
  border-style: solid;
  border-color: #fff;
  border-top: 0;
  border-left: 0;
}

.magic-checkbox:checked + label:before {
  border: #3e97eb;
  background: #3e97eb;
}

.magic-checkbox:checked[disabled] + label:before {
  border: #c9e2f9;
  background: #c9e2f9;
}
.magic-checkbox:checked + label:after {
  display: block;
}
.magic-checkbox:checked + label:before {
  animation-name: none;
}
.magic-checkbox {
  position: absolute;
  display: none;
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
