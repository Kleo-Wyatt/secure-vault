import { callTauriCommand } from '@/shared/api/tauri';

import type { CreateVaultListInput, VaultList } from '../model/types';

type CreateVaultListArgs = {
  name: string;
  template: CreateVaultListInput['template'];
};

export function createVaultList(input: CreateVaultListInput) {
  return callTauriCommand<VaultList, { args: CreateVaultListArgs }>(
    'create_vault_list',
    {
      args: {
        name: input.name,
        template: input.template,
      },
    },
  );
}
