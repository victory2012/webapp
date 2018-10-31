<template>
  <div class="forms">
    <ul>
      <li>
        <div class="title">{{$t('policy.title')}}</div>
        <div><input :placeholder="$t('policy.placeholder')" v-model="policy" type="tel"></div>
      </li>
    </ul>
    <div class="btns">
      <mt-button @click="saveClick" type="primary" size="small">{{$t('policy.btns')}}</mt-button>
    </div>
  </div>
</template>
<script>
import { Indicator } from "mint-ui";
import { getPolicy, updatePolicy } from "@/api/index";
import { onSuccess, onError } from "@/utils/callback";

export default {
  data() {
    return {
      policy: ""
    };
  },
  mounted() {
    this.getTemp();
  },
  methods: {
    saveClick() {
      const regs = /^[0-9]*$/;

      if (!this.policy) {
        onError(`${this.$t("policy.placeholder")}`);
        return;
      }
      if (!regs.test(this.policy)) {
        onError(`${this.$t("policy.voltageCheck")}`);
        return;
      }
      let userObj = {
        voltage: this.policy
      };
      Indicator.open();
      updatePolicy(userObj).then(res => {
        console.log(res);
        Indicator.close();
        if (res.data && res.data.code === 0) {
          this.policy = "";
          onSuccess(`${this.$t("password.success")}`);
        }
      });
    },
    getTemp() {
      getPolicy().then(res => {
        console.log(res);
        let result = res.data;
        if (result && result.code === 0) {
          if (result.data) {
            this.policy = Number(result.data.voltage);
            // this.$set(this.ruleForm, "voltage", Number(result.data.voltage));
          }
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
        flex: 0 0 150px;
      }
    }
  }
}
</style>
