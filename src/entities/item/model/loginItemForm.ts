import { getHttpExternalUrlValidationError } from '@/shared/lib/externalUrl';

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
  return getHttpExternalUrlValidationError(value);
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}
