<template>
  <div class="sidebar"
    :class="GETcollapse? 'openSidebar' : 'closeSidebar'">
    <div @click="colseMask"
      class="mask"></div>
    <ul>
      <li v-for="item in items"
        :key="item.index"
        @click="colseSideBar(item)">
        <router-link :to="'/'+item.index">
          <i :class="item.icon"></i>{{item.title}}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { menuList, GoogleList } from "@/config/sideBarData";
import { getStorage } from "@/utils/transition";

export default {
  data () {
    return {
      collapse: false,
      items: []
    };
  },
  computed: {
    ...mapGetters(['GETcollapse'])
  },
  methods: {
    sideBarData () {
      const loginData = JSON.parse(getStorage("loginData"));
      // const mapType = getStorage("mapType");
      if (loginData && loginData.mapType === 1) {
        this.items = GoogleList();
      } else {
        this.items = menuList();
      }
      if (loginData && loginData.enterpriseRole === "manufacturer") {
        this.items.push({
          icon: "iconfont icon-data",
          index: "policy",
          title: "policy"
        });
      }
      if (loginData && loginData.userRole === "plat_super_admin") {
        this.items.push({
          icon: "iconfont icon-blueberryuserset",
          index: "device",
          title: "device"
        });
      }
      this.items.forEach(key => {
        key.title = this.$t(`menu.${key.title}`);
      });
      console.log(this.items);
    },

    colseSideBar (item) {
      this.collapse = !this.collapse;
      this.$store.commit('SetProjectName', item.title);
      this.$store.commit('setCollapse', false);
    },
    colseMask () {
      this.$store.commit('setCollapse', false);
    }
  },
  mounted () {
    this.sideBarData();
  },
  destroyed () {
    this.items = [];
  }
};
</script>

<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.sidebar {
  display: block;
  position: absolute;
  top: $baseHeader;
  left: 0;
  bottom: 0;
  transition: all 0.2s ease-in;
  .mask {
    position: fixed;
    top: $baseHeader;
    bottom: 0;
    background: rgba($color: #000000, $alpha: 0.3);
    z-index: 555;
  }
  &.openSidebar {
    left: 0;
    right: 0;
    .mask {
      left: 0;
      right: 0;
    }
  }
  &.closeSidebar {
    left: px2rem(-175px);
    right: none;
    .mask {
      left: px2rem(-175px);
      right: none;
    }
  }
  ul {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    width: px2rem(175px);
    background: #394750;
    z-index: 556;
    li {
      font-size: 0;
      padding: 15px 10px;
      a {
        display: block;
        font-size: px2rem(13px);
        color: rgb(191, 203, 217);
        &.router-link-active {
          color: rgb(32, 160, 255);
        }
        i {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
