import { callTauriCommand } from '@/shared/api/tauri';

import type { VaultList } from '../model/types';

export function listVaultLists() {
  return callTauriCommand<VaultList[], Record<string, never>>(
    'list_vault_lists',
    {},
  );
}
