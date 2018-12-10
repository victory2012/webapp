export default {
  updateCount(state, num) {
    state.count = num;
  },
  LogInDate(state, data) {
    state.loginData = data;
    localStorage.setItem('loginData', data);
  },
  SetProjectName(state, data) {
    state.projectName = data;
    localStorage.setItem('projectName', data);
  },
  setCollapse(state, data) {
    state.collapse = data;
  },
  setRealList(state, data) {
    state.realList = data;
  },
  setUserInfo(state, data) {
    state.showIt = data;
  },
  setHistory(state, data) {
    state.historyList = data;
  },
  setfenceList(state, data) {
    state.fenceList = data;
  }
};
