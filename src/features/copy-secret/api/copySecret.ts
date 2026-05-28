import { callTauriCommand } from '@/shared/api/tauri';

type CopySecretArgs = {
  id: string;
  secretType: 'password';
};

type CopySecretResult = {
  value: string;
};

export function copySecret(args: CopySecretArgs) {
  return callTauriCommand<CopySecretResult, { args: CopySecretArgs }>(
    'copy_secret',
    { args },
  );
}
