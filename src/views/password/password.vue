<template>
  <div class="forms">
    <ul>
      <li>
        <div class="title">新密码</div>
        <div><input placeholder="请输入新密码" v-model="password" type="password"></div>
      </li>
    </ul>
    <div class="btns">
      <mt-button @click="saveClick" type="primary" size="small">修改密码</mt-button>
    </div>
  </div>
</template>
<script>
import { Indicator } from "mint-ui";
import { changePassword } from "../../api/index";
import { onTimeOut, onSuccess, onError } from "../../utils/callback";

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
        onError("请输入新密码");
        return;
      }
      Indicator.open();
      changePassword(userObj)
        .then(res => {
          console.log(res);
          Indicator.close();
          if (res.data.code === 1) {
            onTimeOut(this.$router);
          }
          if (res.data.code === 0) {
            this.password = "";
            onSuccess("修改成功！");
          }
          if (res.data.code === -1) {
            onError(res.data.msg);
          }
        })
        .catch(() => {
          onError("服务器请求超时，请稍后重试");
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
        flex: 0 0 80px;
      }
    }
  }
}
</style>
