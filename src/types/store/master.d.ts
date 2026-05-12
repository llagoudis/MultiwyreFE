interface MasterKeyType<T> {
  updatedWithApi: boolean;
  data: T[];
}

interface MasterStoreType {
  assets: MasterKeyType<Assets>;
  country: MasterKeyType<Country>;
  legalForm: MasterKeyType<GenericMasterType>;
  businessNature: MasterKeyType<BusinessNature>;
  incomingPayments: MasterKeyType<GenericMasterType>;
  frequencies: MasterKeyType<GenericMasterType>;
  monthlyRemmitance: MasterKeyType<GenericMasterType>;
}

interface MasterStoreFn {
  setMasterKey: (key: keyof MasterStoreType, data: any[]) => void;
}
