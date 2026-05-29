import type { VaultItemDetail } from '@/entities/item';
import type { UpdateLoginItemInput } from '@/features/update-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type UpdateLoginItemArgs = {
  id: string;
  itemType: 'login';
  login: UpdateLoginItemInput;
};

export function updateLoginItem(id: string, input: UpdateLoginItemInput) {
  return callTauriCommand<VaultItemDetail, { args: UpdateLoginItemArgs }>(
    'update_item',
    {
      args: {
        id,
        itemType: 'login',
        login: input,
      },
    },
  );
}
