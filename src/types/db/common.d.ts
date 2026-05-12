type verificationStates = "APPROVED" | "SUBMITTED" | "PENDING" | "REJECTED";
type RelationType = "company" | "user";

interface CommonKeys {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

interface GenericMasterType extends CommonKeys {
  name: string;
  displayName?: string;
  fireblockAssetId?: string;
}

interface FilterType {
  pageSize?: number;
  pageNumber?: number;
  operation?: string;
  [key: string]: string | number | null | undefined;
}

interface DatagridPage {
  pageSize: number;
  page: number;
}
