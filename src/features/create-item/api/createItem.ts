import type { VaultItemDetail } from '@/entities/item';
import type {
  CreateLoginItemInput,
  CreateTotpItemInput,
} from '@/features/create-item/model/types';
import { callTauriCommand } from '@/shared/api/tauri';

type CreateLoginItemArgs = {
  itemType: 'login';
  login: CreateLoginItemInput;
};

type CreateTotpItemArgs = {
  itemType: 'totp';
  totp: CreateTotpItemInput;
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

export function createTotpItem(input: CreateTotpItemInput) {
  return callTauriCommand<VaultItemDetail, { args: CreateTotpItemArgs }>(
    'create_item',
    {
      args: {
        itemType: 'totp',
        totp: input,
      },
    },
  );
}
