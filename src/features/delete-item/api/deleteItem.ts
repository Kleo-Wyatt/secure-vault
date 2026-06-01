import { callTauriCommand } from '@/shared/api/tauri';

type DeleteItemArgs = {
  id: string;
};

export function deleteItem(args: DeleteItemArgs) {
  return callTauriCommand<void, { args: DeleteItemArgs }>('delete_item', {
    args,
  });
}
