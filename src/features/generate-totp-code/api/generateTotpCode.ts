import { callTauriCommand } from '@/shared/api/tauri';

import type {
  GenerateTotpCodeInput,
  GenerateTotpCodeResult,
} from '../model/types';

type GenerateTotpCodeArgs = {
  id: string;
};

export function generateTotpCode(input: GenerateTotpCodeInput) {
  return callTauriCommand<
    GenerateTotpCodeResult,
    { args: GenerateTotpCodeArgs }
  >('generate_totp_code', {
    args: {
      id: input.id,
    },
  });
}
