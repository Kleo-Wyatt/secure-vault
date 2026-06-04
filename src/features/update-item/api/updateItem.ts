import {
  LEGACY_CREDENTIAL_ITEM_TYPE,
  type VaultItemDetail,
} from '@/entities/item';
import type {
  UpdateCredentialItemInput,
  UpdateSecureNoteItemInput,
} from '@/features/update-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type UpdateCredentialItemArgs = {
  id: string;
  itemType: typeof LEGACY_CREDENTIAL_ITEM_TYPE;
  credential: UpdateCredentialItemInput;
};

type UpdateSecureNoteItemArgs = {
  id: string;
  itemType: 'secure_note';
  secureNote: UpdateSecureNoteItemInput;
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

export function updateSecureNoteItem(
  id: string,
  input: UpdateSecureNoteItemInput,
) {
  return callTauriCommand<VaultItemDetail, { args: UpdateSecureNoteItemArgs }>(
    'update_item',
    {
      args: {
        id,
        itemType: 'secure_note',
        secureNote: input,
      },
    },
  );
}
