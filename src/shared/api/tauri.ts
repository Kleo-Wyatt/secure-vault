import { invoke } from '@tauri-apps/api/core';

export function callTauriCommand<
  TResult,
  TArgs extends Record<string, unknown>,
>(command: string, args?: TArgs): Promise<TResult> {
  return invoke<TResult>(command, args);
}
