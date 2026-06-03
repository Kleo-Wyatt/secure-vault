export const LEGACY_CREDENTIAL_ITEM_TYPE = 'login' as const;

export type VaultItemType =
  | typeof LEGACY_CREDENTIAL_ITEM_TYPE
  | 'totp'
  | 'seed_phrase'
  | 'secure_note';

export type VaultItemSummary = {
  id: string;
  listId?: string;
  title: string;
  type: VaultItemType;
  description: string;
  hasTotp?: boolean;
  isHighSecurity?: boolean;
};

export type CredentialItemDetail = VaultItemSummary & {
  type: typeof LEGACY_CREDENTIAL_ITEM_TYPE;
  username?: string;
  website?: string;
  passwordMasked: string;
  hasTotp?: boolean;
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
  | CredentialItemDetail
  | TotpItemDetail
  | SeedPhraseItemDetail
  | SecureNoteItemDetail;

export function isCredentialItem(
  item?: VaultItemDetail | VaultItemSummary,
): item is CredentialItemDetail {
  return item?.type === LEGACY_CREDENTIAL_ITEM_TYPE;
}
