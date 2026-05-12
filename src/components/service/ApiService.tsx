import axios from "axios";

import LocalstorageService from "./LocalstorageService";

const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use(
  (config) => {
    const token = LocalstorageService.getLocalAccessToken();
    if (token) {
      config.headers["Authorization"] = token;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

AxiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },

  async (err) => {
    return Promise.reject(err);
  },
);

export default AxiosInstance;
