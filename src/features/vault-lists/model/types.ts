export type VaultListTemplate = {
  login: boolean;
  totp: boolean;
  notes: boolean;
};

export type VaultList = {
  id: string;
  name: string;
  template: VaultListTemplate;
  createdAt: string;
  updatedAt: string;
};

export type CreateVaultListInput = {
  name: string;
  template: VaultListTemplate;
};
