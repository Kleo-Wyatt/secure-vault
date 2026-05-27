import type { VaultItemDetail, VaultItemSummary } from './types';

export const mockVaultItemDetails: VaultItemDetail[] = [
  {
    id: 'binance',
    title: 'Binance',
    type: 'login',
    description: 'Login + TOTP',
    username: 'my@email.com',
    passwordMasked: '••••••••••••••••',
    totpCode: '123 456',
    totpExpiresIn: 18,
    notes: 'API withdrawals disabled. Anti-phishing code enabled.',
  },
  {
    id: 'ledger-main',
    title: 'Ledger Main Wallet',
    type: 'seed_phrase',
    description: 'High security item',
    isHighSecurity: true,
    walletName: 'Ledger',
    wordCount: 24,
    derivationPath: "m/44'/0'/0'",
    passphraseStored: false,
  },
  {
    id: 'kraken',
    title: 'Kraken',
    type: 'login',
    description: 'Exchange account',
    username: 'kraken@email.com',
    passwordMasked: '••••••••••••••••',
    notes: 'Withdrawal whitelist enabled.',
  },
  {
    id: 'github-2fa',
    title: 'GitHub 2FA',
    type: 'totp',
    description: 'Authenticator code',
    issuer: 'GitHub',
    account: 'dev@email.com',
    code: '482 913',
    expiresIn: 21,
  },
  {
    id: 'recovery-note',
    title: 'Recovery instructions',
    type: 'secure_note',
    description: 'Encrypted note',
    bodyPreview: 'Offline recovery checklist and backup locations.',
  },
];

export const mockVaultItems: VaultItemSummary[] = mockVaultItemDetails.map(
  ({ id, title, type, description, isHighSecurity }) => ({
    id,
    title,
    type,
    description,
    isHighSecurity,
  }),
);
