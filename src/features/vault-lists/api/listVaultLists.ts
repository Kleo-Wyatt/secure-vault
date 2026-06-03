import { callTauriCommand } from '@/shared/api/tauri';

import type { VaultList } from '../model/types';

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

export async function listVaultLists() {
  const lists = await callTauriCommand<
    VaultListApiResult[],
    Record<string, never>
  >('list_vault_lists', {});

  return lists.map(mapVaultListFromApi);
}
