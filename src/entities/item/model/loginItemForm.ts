export type LoginItemFormValues = {
  title: string;
  username?: string;
  password?: string;
  website?: string;
  notes?: string;
};

export type LoginItemFormState = {
  title: string;
  username: string;
  password: string;
  website: string;
  notes: string;
};

export function getLoginItemFormState(
  values?: Partial<LoginItemFormValues>,
): LoginItemFormState {
  return {
    title: values?.title ?? '',
    username: values?.username ?? '',
    password: values?.password ?? '',
    website: values?.website ?? '',
    notes: values?.notes ?? '',
  };
}

export function normalizeLoginItemFormValues(
  values: LoginItemFormState,
): LoginItemFormValues {
  return {
    title: values.title.trim(),
    username: normalizeOptionalText(values.username),
    password: values.password || undefined,
    website: normalizeOptionalText(values.website),
    notes: normalizeOptionalText(values.notes),
  };
}

export function areLoginItemFormValuesEqual(
  firstValues: LoginItemFormValues,
  secondValues: LoginItemFormValues,
) {
  return (
    firstValues.title === secondValues.title &&
    firstValues.username === secondValues.username &&
    firstValues.password === secondValues.password &&
    firstValues.website === secondValues.website &&
    firstValues.notes === secondValues.notes
  );
}

export function getLoginWebsiteValidationError(value: string) {
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

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
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
