interface getEmailOtpReq {
  email: string;
}

interface verifyOtpReq {
  email: string;
  otp: string;
}

export type { getEmailOtpReq, verifyOtpReq };
