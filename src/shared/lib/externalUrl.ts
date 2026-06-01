export function normalizeHttpExternalUrl(value: string) {
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

    if (!isValidDomain(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function getHttpExternalUrlValidationError(value: string) {
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
      return 'Website must use http or https.';
    }

    if (!isValidDomain(url.hostname)) {
      return 'Enter a valid website domain.';
    }

    return null;
  } catch {
    return 'Enter a valid website URL.';
  }
}

function hasUrlScheme(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function isValidDomain(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();

  if (!normalizedHostname.includes('.')) {
    return false;
  }

  const labels = normalizedHostname.split('.');
  const topLevelDomain = labels[labels.length - 1];

  return (
    labels.every(isValidDomainLabel) && isValidTopLevelDomain(topLevelDomain)
  );
}

function isValidDomainLabel(label: string) {
  return (
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
  );
}

function isValidTopLevelDomain(value?: string) {
  return Boolean(value && /^[a-z]{2,}$/.test(value));
}
