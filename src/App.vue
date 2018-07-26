<template>
  <div id="app">
    <transition name="fade">
      <router-view></router-view>
    </transition>
  </div>
</template>
<style lang="scss">
// @import './common/style/index.scss';
*{
  padding: 0;
  margin: 0;
  list-style: none;
  font-style: normal;
  text-decoration: none;
  border: none;
  font-weight: normal;
  font-family: "Microsoft Yahei";
  box-sizing: border-box;
  -webkit-tap-highlight-color:transparent;
  -webkit-font-smoothing: antialiased;
  -webkit-overflow-scrolling:touch;
  outline: none;
}
// html, body, #app{
//   height: 100%;
//   width: 100%;
// }
</style>
