import { Url } from "url";

interface CountryListType {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

interface DropDownOptionsType {
  value: string;
  label: string;
  flag?: string;
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

interface DropDownOptionsResponseType {
  id: string;
  name: string;
  currency?: string;
  from?: string;
  to?: string;
  label?: string;
  countryCode?: string;
}

export type {
  CountryListType,
  DropDownOptionsType,
  DropDownOptionsResponseType,
};
