export type GenerateTotpCodeInput = {
  id: string;
};

export type GenerateTotpCodeResult = {
  code: string;
  expiresIn: number;
};
