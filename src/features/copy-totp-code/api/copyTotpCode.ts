import { callTauriCommand } from '@/shared/api/tauri';

import type { CopyTotpCodeInput, CopyTotpCodeResult } from '../model/types';

type CopyTotpCodeArgs = {
  id: string;
};

export function copyTotpCode(input: CopyTotpCodeInput) {
  return callTauriCommand<CopyTotpCodeResult, { args: CopyTotpCodeArgs }>(
    'copy_totp_code',
    {
      args: {
        id: input.id,
      },
    },
  );
}
