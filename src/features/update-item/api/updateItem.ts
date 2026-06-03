import type { VaultItemDetail } from '@/entities/item';
import type { UpdateCredentialItemInput } from '@/features/update-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type UpdateCredentialItemArgs = {
  id: string;
  itemType: 'login';
  login: UpdateCredentialItemInput;
};

export function updateCredentialItem(
  id: string,
  input: UpdateCredentialItemInput,
) {
  return callTauriCommand<VaultItemDetail, { args: UpdateCredentialItemArgs }>(
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
