import { getHttpExternalUrlValidationError } from '@/shared/lib/externalUrl';

export type CredentialItemFormValues = {
  title: string;
  username?: string;
  password?: string;
  website?: string;
  notes?: string;
};

export type CredentialItemFormState = {
  title: string;
  username: string;
  password: string;
  website: string;
  notes: string;
};

export function getCredentialItemFormState(
  values?: Partial<CredentialItemFormValues>,
): CredentialItemFormState {
  return {
    title: values?.title ?? '',
    username: values?.username ?? '',
    password: values?.password ?? '',
    website: values?.website ?? '',
    notes: values?.notes ?? '',
  };
}

export function normalizeCredentialItemFormValues(
  values: CredentialItemFormState,
): CredentialItemFormValues {
  return {
    title: values.title.trim(),
    username: normalizeOptionalText(values.username),
    password: values.password || undefined,
    website: normalizeOptionalText(values.website),
    notes: normalizeOptionalText(values.notes),
  };
}

export function areCredentialItemFormValuesEqual(
  firstValues: CredentialItemFormValues,
  secondValues: CredentialItemFormValues,
) {
  return (
    firstValues.title === secondValues.title &&
    firstValues.username === secondValues.username &&
    firstValues.password === secondValues.password &&
    firstValues.website === secondValues.website &&
    firstValues.notes === secondValues.notes
  );
}

export function getCredentialWebsiteValidationError(value: string) {
  return getHttpExternalUrlValidationError(value);
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}
