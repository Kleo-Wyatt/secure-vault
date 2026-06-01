import { openUrl } from '@tauri-apps/plugin-opener';

import { normalizeHttpExternalUrl } from '@/shared/lib/externalUrl';

export function normalizeExternalUrl(value: string) {
  return normalizeHttpExternalUrl(value);
}

export async function openExternalUrl(value: string) {
  const url = normalizeExternalUrl(value);

  if (!url) {
    throw new Error('Invalid external URL.');
  }

  await openUrl(url);
}
