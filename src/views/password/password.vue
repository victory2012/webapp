<template>
  <div class="forms">
    <ul>
      <li>
        <div class="title">{{$t('password.new')}}</div>
        <div><input :placeholder="$t('password.placeholder')" v-model="password" type="password"></div>
      </li>
    </ul>
    <div class="btns">
      <mt-button @click="saveClick" type="primary" size="small">{{$t('password.changeBtn')}}</mt-button>
    </div>
  </div>
</template>
<script>
import { Indicator } from "mint-ui";
import { changePassword } from "../../api/index";
import { onSuccess, onError } from "../../utils/callback";

export default {
  data() {
    return {
      password: ""
    };
  },

  methods: {
    saveClick() {
      let userObj = {
        password: this.password
      };
      if (!this.password) {
        onError(`${this.$t("password.error")}`);
        return;
      }
      Indicator.open();
      changePassword(userObj).then(res => {
        console.log(res);
        Indicator.close();
        if (res.data && res.data.code === 0) {
          this.password = "";
          onSuccess(`${this.$t("password.success")}`);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.forms {
  padding: px2rem(50px) px2rem(20px) px2rem(30px);
  font-size: px2rem(14px);
  .btns {
    text-align: center;
  }
  li {
    display: flex;
    height: px2rem(50px);
    line-height: px2rem(50px);
    border-bottom: 1px dashed #9b9b9b;
    margin-bottom: px2rem(50px);
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
