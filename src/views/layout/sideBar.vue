<template>
  <div class="sidebar" :class="collapse? 'openSidebar' : 'closeSidebar'">
    <div @click="colseSideBar" class="mask"></div>
    <ul>
      <li v-for="item in items" :key="item.index" @click="colseSideBar(item)">
        <router-link :to="'/'+item.index">
          <i :class="item.icon"></i>{{item.title}}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import menuList from "../../config/sideBarData";
import bus from "../../utils/bus";
import { getStorage, setStorage } from "../../utils/transition";

export default {
  data() {
    return {
      collapse: false,
      items: []
    };
  },
  methods: {
    sideBarData() {
      this.items = menuList();
      const loginData = JSON.parse(getStorage("loginData"));
      if (loginData.userRole === "plat_super_admin") {
        this.items.push({
          icon: "iconfont icon-device",
          index: "device",
          title: "device"
        });
      }
      this.items.forEach(key => {
        key.title = this.$t(`menu.${key.title}`);
      });
    },

    colseSideBar(item) {
      this.collapse = !this.collapse;
      setStorage("projectTit", item.title);
      bus.$emit("collapsed", {
        collapse: this.collapse,
        msg: item.title
      });
    }
  },
  mounted() {
    this.sideBarData();
  },
  destroyed() {
    this.items = [];
  },
  computed: {
    onRoutes() {
      return this.$route.path.replace("/", "");
    }
  },
  created() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on("collapse", msg => {
      this.collapse = msg;
    });
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
    left: px2rem(-160px);
    right: none;
    .mask {
      left: px2rem(-160px);
      right: none;
    }
  }
  ul {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    width: px2rem(160px);
    background: #394750;
    z-index: 556;
    li {
      font-size: 0;
      padding: 15px 20px;
      a {
        display: block;
        font-size: px2rem(14px);
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
