import { callTauriCommand } from '@/shared/api/tauri';

import type { CreateVaultListInput, VaultList } from '../model/types';

type CreateVaultListArgs = {
  name: string;
  template: {
    kind: CreateVaultListInput['template']['kind'];
    login: boolean;
    totp: boolean;
    notes: boolean;
  };
};

type VaultListApiTemplate = {
  kind: VaultList['template']['kind'];
  login: boolean;
  totp: boolean;
  notes: boolean;
};

type VaultListApiResult = Omit<VaultList, 'template'> & {
  template: VaultListApiTemplate;
};

function mapVaultListFromApi(list: VaultListApiResult): VaultList {
  return {
    ...list,
    template: {
      kind: list.template.kind,
      credentials: list.template.login,
      totp: list.template.totp,
      notes: list.template.notes,
    },
  };
}

export async function createVaultList(input: CreateVaultListInput) {
  const list = await callTauriCommand<
    VaultListApiResult,
    { args: CreateVaultListArgs }
  >('create_vault_list', {
    args: {
      name: input.name,
      template: {
        kind: input.template.kind,
        login: input.template.credentials,
        totp: input.template.totp,
        notes: input.template.notes,
      },
    },
  });

  return mapVaultListFromApi(list);
}
