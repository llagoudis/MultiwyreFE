import axios from "axios";
import LocalstorageService from "./LocalstorageService";
import toast from "react-hot-toast";

import { encryptPayload, logout } from "~/helpers/helper";
import axiosRetry from "axios-retry";
import localStorageService from "./LocalstorageService";

const ProtectedAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosRetry(ProtectedAxiosInstance, {
  retries: 10,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: any) => {
    const token = localStorageService.getLocalAccessToken();

    if (error?.response?.data?.message === "Error: Token Expired!!" && token) {
      console.log(
        "error?.response?.data?.message: ",
        error?.response?.data?.message,
      );
      toast.error(error?.response?.data?.message);
      logout();
      return false;
    }

    const url = error?.config?.url;
    if (
      url === "/exchange/addOrder" ||
      url === "/transaction" ||
      (typeof url === "string" && url.includes("/org/"))
    ) {
      return false;
    }

    if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
      if (error?.config?.url) {
        const excludedEndpoints = ["/exchange/addOrder", "/transaction", "/org/"];
        console.log("excludedEndpoints___: ", excludedEndpoints);
        const requestUrl = error.config.url;
        if (
          excludedEndpoints.some((endpoint) => requestUrl.includes(endpoint))
        ) {
          return false;
        }
      }
    }

    if (error?.response?.status) {
      return error.response.status >= 450;
    }
    return false;
  },
});

ProtectedAxiosInstance.interceptors.request.use(
  (config) => {
    const controller = new AbortController();

    const token = LocalstorageService.getLocalAccessToken();

    if (!token) {
      controller.abort();
    }

    if (token) {
      config.headers["Authorization"] = token;
    }

    const myIp = localStorageService.getIPAddress() ?? "IP not available";

    config.signal = controller.signal;

    if (config.data instanceof FormData) {
      config.data.append("ipAddress", myIp);
    } else {
      config.data = encryptPayload(config.data);
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

ProtectedAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === "Network Error" && !error.response) {
      // toast.error("Network error - make sure API is running");
    }

    let parsedError;

    console.log("error?.response: ", error?.response);
    try {
      parsedError = JSON.parse(error?.response?.data?.message);
    } catch (e) {
      parsedError = error?.response?.data?.message;

      if (parsedError) {
        toast.error(parsedError);
      }
    }
    console.log("parsedError: ", parsedError);

    if (error.message === "Error: Token Expired!!") {
      logout();
    }

    return Promise.reject(error);
  },
);

export default ProtectedAxiosInstance;
