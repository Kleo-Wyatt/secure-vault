import { openUrl } from '@tauri-apps/plugin-opener';

function hasUrlScheme(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

export function normalizeExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const candidateUrl = hasUrlScheme(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(candidateUrl);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function openExternalUrl(value: string) {
  const url = normalizeExternalUrl(value);

  if (!url) {
    throw new Error('Invalid external URL.');
  }

  await openUrl(url);
}
