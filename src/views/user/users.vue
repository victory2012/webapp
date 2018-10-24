<template>
  <div class="forms">
    <div class="buttons">
      <mt-button @click="Editor" v-show="phoneEdit" type="primary" size="small">{{$t('user.edit')}}</mt-button>
      <mt-button @click="saveClick" v-show="saveInfo" type="danger" size="small">{{$t('user.save')}}</mt-button>
      <mt-button @click="cancelClick" v-show="saveInfo" type="default" size="small">{{$t('user.cancel')}}</mt-button>
    </div>
    <ul>
      <li>
        <div class="title">{{$t('user.userName')}}</div>
        <div><input :value="userArr.userName" type="text" disabled></div>
      </li>
      <li>
        <div class="title">{{$t('user.userRole')}}</div>
        <div><input :value="userArr.userRole" type="text" disabled></div>
      </li>
      <li>
        <div class="title">{{$t('user.enterpriseRole')}}</div>
        <div><input :value="userArr.enterpriseRole" type="text" disabled></div>
      </li>
      <li>
        <div class="title">{{$t('user.enterpriseName')}}</div>
        <div><input :value="userArr.enterpriseName" type="text" disabled></div>
      </li>
      <li>
        <div class="title">{{$t('user.phone')}}</div>
        <div><input v-model="userArr.phoneNumber" type="text" :disabled="phoneEdit"></div>
      </li>
      <li>
        <div class="title">{{$t('user.email')}}</div>
        <div><input v-model="userArr.email" type="text" :disabled="phoneEdit"></div>
      </li>
    </ul>
    <!-- <button @click="creatDevice" class="creatBtn">创建设备</button> -->
  </div>
</template>
<script>
import { Indicator } from "mint-ui";
import { getUserInfo, changeUserInfo } from "../../api/index";
import { onSuccess } from "../../utils/callback";

export default {
  data() {
    return {
      phoneEdit: true,
      saveInfo: false,
      userArr: {}
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      Indicator.open();
      this.getData();
    },
    getData() {
      getUserInfo().then(res => {
        console.log(res.data);
        Indicator.close();

        if (res.data && res.data.code === 0) {
          this.userArr = res.data.data;
          this.userArr.phoneNumber =
            res.data.data.phoneNumber || this.$t("user.no");
          this.userArr.email = res.data.data.email || this.$t("user.no");
        }
      });
    },
    Editor() {
      this.phoneEdit = false;
      this.saveInfo = true;
      this.userArr.phoneNumber = "";
      this.userArr.email = "";
    },
    cancelClick() {
      this.phoneEdit = true;
      this.saveInfo = false;
      this.getData();
    },
    saveClick() {
      Indicator.open();
      let userObj = {
        email: this.userArr.email,
        phoneNumber: this.userArr.phoneNumber
      };
      changeUserInfo(userObj).then(res => {
        console.log(res);
        Indicator.close();
        if (res.data && res.data.code === 0) {
          this.userMsgBox = false;
          this.ruleForm = {};
          onSuccess(`${this.$t("user.seccess")}`);
          this.getData();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.forms {
  padding: px2rem(10px) px2rem(20px) px2rem(30px);
  font-size: px2rem(14px);
  .buttons {
    text-align: right;
  }
  li {
    display: flex;
    height: px2rem(50px);
    line-height: px2rem(50px);
    border-bottom: 1px dashed #9b9b9b;
    div {
      flex: 1;
      input {
        height: px2rem(30px);
        background: #f2f2f2;
        color: #484848;
        width: 80%;
        border-radius: 3px;
        text-indent: 1em;
      }
      &.title {
        flex: 0 0 130px;
      }
    }
  }
}
</style>
