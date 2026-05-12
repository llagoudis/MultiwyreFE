class LocalstorageService {
  setLocalAccessToken(token: string) {
    localStorage.setItem("token", "Bearer " + token);
  }

  getLocalAccessToken() {
    return localStorage.getItem("token");
  }

  setUserName(userName: string) {
    localStorage.setItem("userName", userName);
  }

  getUserName() {
    return localStorage.getItem("userName");
  }

  clearStorage() {
    localStorage.clear();
  }
}

const localStorageService = new LocalstorageService();

export default localStorageService;
