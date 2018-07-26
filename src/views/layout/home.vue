<template>
  <div>
    <topHead></topHead>
    <div class="content-box">
      <sidebar></sidebar>
      <div class="app-content">
        <transition name="move" mode="out-in">
          <!-- <keep-alive>
            <router-view />
          </keep-alive> -->
          <router-view />
        </transition>
      </div>
    </div>
  </div>
</template>
<style>
  .app-content {
    overflow-x: hidden;
  }
</style>
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
