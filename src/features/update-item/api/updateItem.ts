import {
  LEGACY_CREDENTIAL_ITEM_TYPE,
  type VaultItemDetail,
} from '@/entities/item';
import type { UpdateCredentialItemInput } from '@/features/update-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type UpdateCredentialItemArgs = {
  id: string;
  itemType: typeof LEGACY_CREDENTIAL_ITEM_TYPE;
  credential: UpdateCredentialItemInput;
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
        itemType: LEGACY_CREDENTIAL_ITEM_TYPE,
        credential: input,
      },
    },
  );
}
