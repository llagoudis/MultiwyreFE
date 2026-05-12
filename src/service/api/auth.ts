import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

export const verify2FAOTP = (otp: string): APIFunction<unknown> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", { otp }),
  );
