import { invoke } from '@tauri-apps/api/core';

type DeleteItemArgs = {
  id: string;
};

export async function deleteItem(args: DeleteItemArgs): Promise<void> {
  await invoke('delete_item', { args });
}