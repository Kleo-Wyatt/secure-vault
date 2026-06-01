export type VaultItemType = 'login' | 'totp' | 'seed_phrase' | 'secure_note';

export type VaultItemSummary = {
  id: string;
  title: string;
  type: VaultItemType;
  description: string;
  isHighSecurity?: boolean;
};

export type LoginItemDetail = VaultItemSummary & {
  type: 'login';
  username?: string;
  website?: string;
  passwordMasked: string;
  notes?: string;
};

export type TotpItemDetail = VaultItemSummary & {
  type: 'totp';
  issuer?: string;
  account?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  code?: string;
  expiresIn?: number;
  notes?: string;
};

export type SeedPhraseItemDetail = VaultItemSummary & {
  type: 'seed_phrase';
  walletName: string;
  wordCount: 12 | 18 | 24;
  derivationPath?: string;
  passphraseStored: boolean;
};

export type SecureNoteItemDetail = VaultItemSummary & {
  type: 'secure_note';
  bodyPreview: string;
};

export type VaultItemDetail =
  | LoginItemDetail
  | TotpItemDetail
  | SeedPhraseItemDetail
  | SecureNoteItemDetail;
