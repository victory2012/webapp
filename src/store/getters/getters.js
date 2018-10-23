export default {
  enterpriseName(state) {
    console.log(state);
    if (state.loginData) {
      return JSON.parse(state.loginData).enterpriseName;
    }
    return '';
  },
  userName(state) {
    if (state.loginData) {
      return JSON.parse(state.loginData).userName;
    }
    return '';
  },
  GETMAPTYPE(state) {
    if (state.loginData) {
      return JSON.parse(state.loginData).mapType;
    }
    return '';
  }
};
