class LocalstorageService {
  setLocalAccessToken(token: string) {
    localStorage.setItem("token", "Bearer " + token);
  }

  setAdminEmail(email: string) {
    localStorage.setItem("adminEmail", email);
  }
  setIpAddress(ip: string) {
    localStorage.setItem("ipAddress", ip);
  }
  getIPAddress() {
    return localStorage.getItem("ipAddress");
  }

  getAdminEmail() {
    return localStorage.getItem("adminEmail");
  }

  getLocalAccessToken() {
    return localStorage.getItem("token");
  }

  encodeAuthBody(data: any) {
    return localStorage.setItem("authBody", btoa(JSON.stringify(data)));
  }

  setSecurityBody(data: any) {
    return localStorage.setItem("secureBody", btoa(JSON.stringify(data)));
  }

  updateSecurityBody(updatedKeys: Record<string, any>) {
    const data = localStorage.getItem("secureBody");
    let parsedData = data ? JSON.parse(atob(data)) : {};
    parsedData = { ...parsedData, ...updatedKeys };
    localStorage.setItem("secureBody", btoa(JSON.stringify(parsedData)));
  }

  getSecurityBody() {
    const data = localStorage.getItem("secureBody");
    return data ? JSON.parse(atob(data)) : undefined;
  }

  encodeSwitchAccounts(data: any) {
    return localStorage.setItem("switchAccounts", btoa(JSON.stringify(data)));
  }

  decodeSwitchAccounts() {
    const data = localStorage.getItem("switchAccounts");
    return data ? JSON.parse(atob(data)) : undefined;
  }

  updateSwitchAccounts(updatedKeys: Record<string, any>) {
    const data = localStorage.getItem("switchAccounts");
    let parsedData = data ? JSON.parse(atob(data)) : [];

    parsedData = parsedData.map((item: any) => {
      if (item.id === updatedKeys.id) {
        return {
          ...item,
          ...updatedKeys,
        };
      } else {
        return item;
      }
    });

    localStorage.setItem("switchAccounts", btoa(JSON.stringify(parsedData)));
  }

  decodeAuthBody() {
    const data = localStorage.getItem("authBody");
    return data ? JSON.parse(atob(data)) : undefined;
  }

  updateAuthBody(updatedKeys: Record<string, any>) {
    const data = localStorage.getItem("authBody");
    let parsedData = data ? JSON.parse(atob(data)) : {};
    parsedData = { ...parsedData, ...updatedKeys };
    localStorage.setItem("authBody", btoa(JSON.stringify(parsedData)));
  }
  encodeVerification(data: any) {
    return localStorage.setItem("Verification", btoa(JSON.stringify(data)));
  }

  decodeVerification() {
    const data = localStorage.getItem("Verification");
    return data ? JSON.parse(atob(data)) : undefined;
  }

  updateVerification(updatedKeys: Record<string, any>) {
    const data = localStorage.getItem("Verification");
    let parsedData = data ? JSON.parse(atob(data)) : {};
    parsedData = { ...parsedData, ...updatedKeys };
    localStorage.setItem("Verification", btoa(JSON.stringify(parsedData)));
  }

  setItem(key: string, data: string) {
    return localStorage.setItem(key, data);
  }

  getItem(key: string) {
    return localStorage.getItem(key);
  }

  clearStorage() {
    localStorage.clear();
  }
}

const localStorageService = new LocalstorageService();

export default localStorageService;
