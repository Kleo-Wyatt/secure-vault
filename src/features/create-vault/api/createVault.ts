import { callTauriCommand } from '@/shared/api/tauri';

type CreateVaultArgs = {
  masterPassword: string;
};

type CreateVaultResult = {
  success: boolean;
  message: string;
};

export function createVault(args: CreateVaultArgs) {
  return callTauriCommand<CreateVaultResult, { args: CreateVaultArgs }>(
    'create_vault',
    { args },
  );
}
