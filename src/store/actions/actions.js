export default {
  updateCountAsync({ commit }, data) {
    setTimeout(() => {
      commit('updateCount', data.num);
    }, data.time);
  }
};
