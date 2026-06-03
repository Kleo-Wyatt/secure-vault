export type CreateCredentialItemTotpInput = {
  issuer?: string;
  account?: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: number;
};

export type CreateCredentialItemInput = {
  listId?: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  totp?: CreateCredentialItemTotpInput;
  notes?: string;
};

export type CreateTotpItemInput = {
  listId?: string;
  title: string;
  issuer?: string;
  account: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: number;
  notes?: string;
};
