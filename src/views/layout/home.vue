<template>
  <div>
    <topHead></topHead>
    <div class="content-box">
      <sidebar></sidebar>
      <div class="content">
        <transition name="move" mode="out-in">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import topHead from './topHead';
import sidebar from './sideBar';

export default {
  components: {
    topHead,
    sidebar
  },
  data() {
    return {
      transitionName: "",
      tagsList: false
    };
  },
  watch: {
    $route(to, from) {
      const toDepth = to.path.split("/").length;
      const fromDepth = from.path.split("/").length;
      this.transitionName = toDepth < fromDepth ? "slide-right" : "slide-left";
    }
  }
};
</script>
