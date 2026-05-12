interface WhitelistAddress {
  label: string;
  id: number | string;
  userId: string;
  assetAddress: string;
  assetId: string;
  description: string;
  status: boolean;
}
interface LegalDocuments extends CommonKeys {
  id: string;
  title: string;
  policyDocumentType: number;
  documentLink: Url;
  PolicyDocumentType: PolicyDocumentType;
  documentText: string;
}

interface PolicyDocumentType extends CommonKeys {
  displayName: string;
  name: string;
}

interface Security {
  IpAttempts: string;
  blockingDuration: string;
  loginAttempts: string;
  logoutMinutes: string;
  messageAfterLogout: string;
  messageBeforeLogout: string;
  passwordAttempts: string;
  timeoutPadding: string;
  id: number;
}
