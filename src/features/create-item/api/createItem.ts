import type { VaultItemDetail } from '@/entities/item';
import type { CreateLoginItemInput } from '@/features/create-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type CreateLoginItemArgs = {
  itemType: 'login';
  login: CreateLoginItemInput;
};

export function createLoginItem(input: CreateLoginItemInput) {
  return callTauriCommand<VaultItemDetail, { args: CreateLoginItemArgs }>(
    'create_item',
    {
      args: {
        itemType: 'login',
        login: input,
      },
    },
  );
}
