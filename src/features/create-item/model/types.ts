export type CreateLoginItemInput = {
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
};

export type CreateTotpItemInput = {
  title: string;
  issuer?: string;
  account: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: number;
  notes?: string;
};
