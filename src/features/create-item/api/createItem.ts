import {
  LEGACY_CREDENTIAL_ITEM_TYPE,
  type VaultItemDetail,
} from '@/entities/item';
import type {
  CreateCredentialItemInput,
  CreateTotpItemInput,
} from '@/features/create-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type CreateCredentialItemArgs = {
  itemType: typeof LEGACY_CREDENTIAL_ITEM_TYPE;
  listId?: string;
  credential: Omit<CreateCredentialItemInput, 'listId'>;
};

type CreateTotpItemArgs = {
  itemType: 'totp';
  listId?: string;
  totp: Omit<CreateTotpItemInput, 'listId'>;
};

export function createCredentialItem(input: CreateCredentialItemInput) {
  const { listId, ...credential } = input;

  return callTauriCommand<VaultItemDetail, { args: CreateCredentialItemArgs }>(
    'create_item',
    {
      args: {
        itemType: LEGACY_CREDENTIAL_ITEM_TYPE,
        listId,
        credential,
      },
    },
  );
}

export function createTotpItem(input: CreateTotpItemInput) {
  const { listId, ...totp } = input;

  return callTauriCommand<VaultItemDetail, { args: CreateTotpItemArgs }>(
    'create_item',
    {
      args: {
        itemType: 'totp',
        listId,
        totp,
      },
    },
  );
}
