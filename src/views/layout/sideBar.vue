<template>
  <div class="sidebar" :class="collapse? 'openSidebar' : 'closeSidebar'">
    <div class="mask" @click="colseSideBar" v-show="collapse"></div>
    <el-menu class="sidebar-el-menu" :default-active="onRoutes" background-color="#324157" text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>
            <el-menu-item v-for="(subItem,i) in item.subs" :key="i" :index="subItem.index">
              <template>
                <i :class="subItem.icon"></i>
                <span slot="title">{{ subItem.title }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import menuList from "../../config/sideBarData";
import bus from "../../utils/bus";

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
      const loginData = JSON.parse(localStorage.getItem("loginData"));
      if (loginData.userRole === "plat_super_admin") {
        this.items.push({
          icon: "el-icon-setting",
          index: "device",
          title: "设备管理"
        });
      }
    },
    colseSideBar() {
      this.collapse = !this.collapse;
      bus.$emit('collapsed', this.collapse);
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
  width: px2rem(200px);
  top: px2rem(60px);
  bottom: 0;
  overflow-y: scroll;
  transition: all 0.35s ease-in;
  z-index: 666;
}
.mask {
  position: absolute;
  top: px2rem(60px);
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 555;
}
.openSidebar {
  left: 0;
}
.closeSidebar {
  left: px2rem(-200px);
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: px2rem(200px);
}
.sidebar > ul {
  height: 100%;
}
</style>
