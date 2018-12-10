export default {
  enterpriseName(state) {
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
  },
  GETprojectName(state) {
    return state.projectName;
  },
  GETcollapse(state) {
    return state.collapse;
  },
  GETuserInfo(state) {
    return state.showIt;
  },
  GETrealList(state) {
    return state.realList;
  },
  GETHistoryList(state) {
    return state.historyList;
  },
  GETfenceList(state) {
    return state.fenceList;
  }
};
