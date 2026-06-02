import type { VaultItemDetail } from '@/entities/item';
import type {
  CreateLoginItemInput,
  CreateTotpItemInput,
} from '@/features/create-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type CreateLoginItemArgs = {
  itemType: 'login';
  listId?: string;
  login: Omit<CreateLoginItemInput, 'listId'>;
};

type CreateTotpItemArgs = {
  itemType: 'totp';
  listId?: string;
  totp: Omit<CreateTotpItemInput, 'listId'>;
};

export function createLoginItem(input: CreateLoginItemInput) {
  const { listId, ...login } = input;

  return callTauriCommand<VaultItemDetail, { args: CreateLoginItemArgs }>(
    'create_item',
    {
      args: {
        itemType: 'login',
        listId,
        login,
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
