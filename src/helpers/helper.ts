import CryptoJS from "crypto-js";
import Router from "next/router";
import toast from "react-hot-toast";
import { convertImageToBase64Api } from "~/service/ApiRequests";
import localStorageService from "~/service/LocalstorageService";
import { ApiHandler } from "~/service/UtilService";
import useGlobalStore from "~/store/useGlobalStore";

const maskAddress = (maskString: string, assetId: string) => {
  const masked = maskString?.split("");
  const numberOfletter = assetId === "EUR" ? 4 : 5;
  const firstFiveLetters = masked.slice(0, numberOfletter);
  const lastFiveLetters = masked.slice(-numberOfletter);
  return firstFiveLetters.join("") + "*****" + lastFiveLetters.join("");
};

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
export const encryptPayload = (data: any) => {
  if (!encryptionKey) {
    throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY is not configured");
  }
  const myIp = localStorageService.getIPAddress() ?? "IP not available";
  const ipAddedData = { ...data, ipAddress: myIp };
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(ipAddedData),
    encryptionKey,
  );
  const encrypt = encryptedData.toString();

  return { data: encrypt };
};

export const decryptResponse = (data: any) => {
  if (!encryptionKey) {
    throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY is not configured");
  }
  const decryptedData = CryptoJS.AES.decrypt(data, encryptionKey).toString(
    CryptoJS.enc.Utf8,
  );

  return JSON.parse(decryptedData);
};

export const euroFormat = Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
});

export const bigNumber = (v: any, currency?: any) => {
  if (v) {
    return Number(v ?? 0).toFixed(6);
  }
  return 0;
};

export function coinName(value: any) {
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "qa") {
    return value === "BTC"
      ? "BTC"
      : value === "USDT.t"
      ? "USDT_TRC20"
      : value === "USDC"
      ? "USDC_ERC20"
      : value === "USDT"
      ? "USDT_ERC20"
      : value === "ETH"
      ? "ETH"
      : value;
  } else {
    return value === "BTC"
      ? "BTC"
      : value === "USDT.t"
      ? "USDT_TRC20"
      : value === "USDC"
      ? "USDC_ERC20"
      : value === "USDT"
      ? "USDT_ERC20"
      : value === "ETH"
      ? "ETH"
      : value;
  }
}

export function coinForKrakenName(value: any) {
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "qa") {
    return value === "USDC_TRC20" || value === "USDT_TRC20"
      ? "USDT"
      : value === "USDC_ERC20" || value === "USDC_POLYGON"
      ? "USDC"
      : value === "USDT_ERC20" || value === "USDT_POLYGON"
      ? "USDT"
      : value;
  } else {
    // Keep in sync with qa mappings so OTC icons/pairs resolve on local/dev too (QA #58).
    return value === "BTC"
      ? "BTC"
      : value === "TRX_USDT_S2UZ"
      ? "USDT"
      : value === "USDT_TRC20"
      ? "USDT.t"
      : value === "USDC" || value === "USDC_ERC20" || value === "USDC_POLYGON"
      ? "USDC"
      : value === "USDT_ERC20" || value === "USDT_POLYGON"
      ? "USDT"
      : value === "ETH"
      ? "ETH"
      : value;
  }
}

export function changeName(value: string) {
  const parts = value.split("/");
  if (parts[0] === "USDT.t") {
    parts[0] = "USDT";
  }
  if (parts[1] === "USDT.t") {
    parts[1] = "USDT";
  }
  const result = parts.join("/");
  return result;
}

function dateValidation(item: any) {
  const currentDate = new Date();
  if (!item.validFrom && !item.validTo) {
    return true;
  }
  if (item.validFrom) {
    const validFromDate = new Date(item.validFrom);
    validFromDate.setHours(0, 0, 0, 0);
    if (currentDate < validFromDate) return false;
  }
  if (item.validTo) {
    const validToDate = new Date(item.validTo);
    validToDate.setHours(23, 59, 59, 999);
    if (currentDate > validToDate) return false;
  }
  return true;
}

const formatDate = (date: string | undefined): string => {
  if (!date) return "";

  const utcDate = new Date(date);
  // Get user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Convert UTC time to local time based on user's time zone
  const localDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: userTimeZone }),
  );
  // Format the local date and time
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();
  let hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const ampm = localDate.getHours() >= 12 ? "PM" : "AM";
  hours = (parseInt(hours) % 12 || 12).toString();
  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  return formattedDate;
};
const tableFormatDate = (date: string | undefined): string => {
  if (!date) return "";
  const utcDate = new Date(date);
  // Get user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Convert UTC time to local time based on user's time zone
  const localDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: userTimeZone }),
  );
  // Format the local date and time
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
const logout = async () => {
  localStorage.clear();
  useGlobalStore.getState().resetStore();

  const ip = await fetch("https://api.ipify.org?format=json");
  const res = await ip.json();

  localStorageService.setIpAddress(res?.ip);
  void Router.replace("/auth/login");
};

const findIp = async () => {
  return fetch("https://api.ipify.org?format=json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch IP address");
      }
      return response.json();
    })
    .then(async (data) => {
      const res = await data.ip;
      return res;
    })
    .catch((error) => {
      console.error("Error fetching IP address:", error);
      throw error; // Re-throw the error to propagate it
    });
};

export function convertUrlParams(params: FilterType) {
  const paramsObject: Record<string, string> = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      paramsObject[key] = String(params[key]);
    }
  }

  const queryParams = new URLSearchParams(paramsObject);

  return queryParams.toString(); // Convert URLSearchParams to string
}

const getStatusColor = (status: string): string => {
  if (status.toUpperCase() === "COMPLETED") {
    return "#A8E6CF";
  } else if (status.toUpperCase() === "PENDING") {
    return "#FDFFB6";
  } else if (status.toUpperCase() === "FAILED") {
    return "#FF8B94";
  } else {
    return "white";
  }
};

const roleRestrictions: Record<string, string[]> = {
  ex_user_viewer: ["/app/exchange", "/app/profile"],
};

export function Debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function ExportCsv(reportHeaderval: any[], fileName: string) {
  const headerRow = reportHeaderval[0]
    ? Object.keys(reportHeaderval[0]).join(",")
    : "";
  const csvContent =
    "data:text/csv; charset=utf-8,\uFEFF" +
    headerRow +
    "\n" +
    reportHeaderval.map((row) => Object.values(row).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
}

export const onCopy = (text: any) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // showMessage('Copied to clipboard!');
      toast.success("Copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy!", err);
    });
};

export const convertImageToBase64 = async (
  imageUrl?: string,
): Promise<string | null> => {
  try {
    console.log("Converting image via API:", imageUrl);

    // Validate URL format
    if (
      !imageUrl ||
      (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
    ) {
      console.error("Invalid image URL format:", imageUrl);
      return null;
    }

    // Call your backend API
    const [res] = await ApiHandler<any>(convertImageToBase64Api, {
      imageUrl,
    });

    console.log("response", res);

    // Check if successful
    if (res?.success && res?.body?.base64) {
      console.log("API conversion successful", {
        contentType: res.body.contentType,
        size: res.body.size,
      });
      return res.body.base64;
    } else {
      console.error("API conversion failed:", res?.message);
      throw new Error(res?.message ?? "API conversion failed");
    }
  } catch (error) {
    console.error("Error converting image via API:", error);

    // Optional: Keep client-side as fallback for same-origin images
    try {
      console.log("Trying client-side fallback...");

      // Check if it's a same-origin URL or allows CORS
      const response = await fetch(imageUrl ?? "", {
        mode: "cors", // Explicit CORS mode
        headers: {
          Accept: "image/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Validate it's actually an image
      if (!blob.type.startsWith("image/")) {
        throw new Error("Response is not an image");
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log("Client-side conversion successful");
          resolve(result);
        };
        reader.onerror = () => {
          console.error("FileReader error:", reader.error);
          reject(new Error("Failed to read image data"));
        };
        reader.readAsDataURL(blob);
      });
    } catch (fallbackError) {
      console.error("Client-side fallback also failed:", fallbackError);
      return null;
    }
  }
};

export const TEST_COINS = {
  BTC: "BTC",
  BSC: "BSC",
  ETH: "ETH",
  USDC_ERC20: "USDC_ERC20",
  USDT_ERC20: "USDT_ERC20",
  USDC_BSC: "USDC_BSC",
  USDT_BSC: "USDT_BSC",
  USDC_TRC20: "USDC_TRC20",
  USDT_TRC20: "USDT_TRC20",
  USDT_POLYGON: "USDT_POLYGON",
  USDC_POLYGON: "USDC_POLYGON",
  EUR: "EUR",
  USDT: "USDT",

  // dev
  POLYGON: "POLYGON",
  USDC_ETH_TEST5_AN74: "USDC_ETH_TEST5_AN74",
  ETH_TEST5: "ETH_TEST5",
  ETC_TEST: "ETC_TEST",
  BTC_TEST: "BTC_TEST",
  USDT_BSC_TEST: "USDT_BSC_TEST",
  TRX_TEST: "TRX_TEST",
  USDCPOS_B6BMTT9T_F8E4: "USDCPOS_B6BMTT9T_F8E4",

  // prod
  TRX: "TRX",
  USDC: "USDC",
  TRX_USDT_S2UZ: "TRX_USDT_S2UZ",
};

export const formatDateTime = (
  date: string | undefined,
  showSeconds = false,
): string => {
  if (!date) {
    return "Date not provided";
  }
  const utcDate = new Date(date);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: userTimeZone }),
  );
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();
  let hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const seconds = localDate.getSeconds().toString().padStart(2, "0");
  const ampm = localDate.getHours() >= 12 ? "PM" : "AM";
  hours = (parseInt(hours) % 12 || 12).toString();
  const formattedDate = `${day}-${month}-${year}${" "}${hours}:${minutes}${
    showSeconds ? ":" + seconds : ""
  } ${ampm}`;
  return formattedDate;
};

export const copyToClipboard = async (value?: string) => {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied!");
  } catch {
    toast.error("Failed to copy address");
  }
};

export const formatAddress = (address?: string, start = 4, end = 4): string => {
  if (!address) return "-";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export {
  dateValidation,
  findIp,
  formatDate,
  getStatusColor,
  logout,
  maskAddress,
  roleRestrictions,
  tableFormatDate,
};
