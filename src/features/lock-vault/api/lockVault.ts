import { callTauriCommand } from '@/shared/api/tauri';

type LockVaultResult = {
  success: boolean;
  message: string;
};

export function lockVault() {
  return callTauriCommand<LockVaultResult, Record<string, never>>(
    'lock_vault',
    {},
  );
}
