export type VaultListKind =
  | 'credentials'
  | 'seed_phrase'
  | 'bank_card'
  | 'secure_note';

export type VaultListTemplate = {
  kind: VaultListKind;
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
