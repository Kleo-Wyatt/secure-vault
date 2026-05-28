import type { VaultItemDetail } from '@/entities/item';
import { callTauriCommand } from '@/shared/api/tauri';

export function listItems() {
  return callTauriCommand<VaultItemDetail[], Record<string, never>>(
    'list_items',
    {},
  );
}
