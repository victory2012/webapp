<template>
  <div class="header">
    <!-- <mt-header fixed :title="titles">
      <mt-button @click="triggerList" slot="left">
        <i class="iconfont icon-list3"></i>
        {{username}}
      </mt-button>
      <mt-button @click="showMore" slot="right">
        {{custormname}}
        <i class="iconfont icon-icon11 more"></i>
      </mt-button>
    </mt-header> -->
    <header class="fixedHeader">
      <div @click="triggerList"
        class="is_left">
        <i class="iconfont icon-list3"></i>
        {{enterpriseName}}
      </div>
      <!-- <div>{{titles}}</div> -->
      <div>{{GETprojectName}}</div>
      <div @click="showMore"
        class="is_right">
        {{userName}}
        <i class="iconfont icon-icon11 more"></i>
      </div>
    </header>
    <div class="userInfo"
      :class="[GETuserInfo ? 'showit' :'']">
      <ul @click="showMore">
        <li @click="toUser">
          <i class="iconfont icon-user"></i>
          {{$t('userInfo.userMsg')}}
          <!-- <router-link to="/user">个人信息</router-link> -->
        </li>
        <li @click="toPassword">
          <i class="iconfont icon-password"></i>
          {{$t('userInfo.pasword')}}
          <!-- <router-link to="/password">修改密码</router-link> -->
        </li>
        <li @click="logout">
          <i class="iconfont icon-logout"></i>
          <span>{{$t('userInfo.logOut')}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { getStorage, clearStorage } from "../../utils/transition";

export default {
  data () {
    return {
      showIt: false,
      collapse: false,
      titles: getStorage("projectTit")
    };
  },
  computed: {
    ...mapGetters(["enterpriseName", "userName", 'GETuserInfo', 'GETcollapse', 'GETprojectName'])
  },
  mounted () {
  },
  methods: {
    logout () {
      clearStorage("loginData");
      clearStorage("projectName");
      this.$router.push("/login");
    },
    toUser () {
      this.$router.push("/user");
      this.titles = this.$t("userInfo.userMsg");
      this.$store.commit('SetProjectName', this.titles);
    },
    toPassword () {
      this.$router.push("/password");
      this.titles = this.$t("userInfo.pasword");
      this.$store.commit('SetProjectName', this.titles);
    },
    showMore () {
      this.$store.commit('setUserInfo', !this.GETuserInfo);
      this.$store.commit('setRealList', true);
      this.$store.commit('setHistory', true);
      this.$store.commit('setCollapse', false);
      this.$store.commit('setfenceList', true);
    },
    triggerList () {
      // this.collapse = !this.collapse;
      // console.log('collapse', this.collapse);
      this.$store.commit('setRealList', true);
      this.$store.commit('setfenceList', true);
      this.$store.commit('setHistory', true);
      this.$store.commit('setUserInfo', false);
      this.$store.commit('setCollapse', !this.GETcollapse);
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
  .fixedHeader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    font-size: 0;
    width: 100%;
    color: #ffffff;
    background-color: #26a2ff;
    z-index: 66666;
    div {
      font-size: 14px;
      display: inline-block;
      width: 33.33%;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.is_left {
        text-align: left;
      }
      &.is_right {
        text-align: right;
      }
      .iconfont {
        vertical-align: middle;
      }
    }
  }
  // .iconfont {
  //   // font-size: px2rem(16px);
  //   vertical-align: middle;
  // }
  // .more {
  //   font-size: px2rem(12px);
  // }
  .userInfo {
    position: absolute;
    top: ($baseHeader + 5px);
    right: 5px;
    width: px2rem(140px);
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
      padding-left: 10px;
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
