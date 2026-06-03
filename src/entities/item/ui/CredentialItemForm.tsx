import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

import {
  areCredentialItemFormValuesEqual,
  getCredentialItemFormState,
  getCredentialWebsiteValidationError,
  normalizeCredentialItemFormValues,
  type CredentialItemFormValues,
} from '@/entities/item/model/credentialItemForm';
import { Button } from '@/shared/ui/button';

import {
  CredentialItemPasswordField,
  CredentialItemTextareaField,
  CredentialItemTextField,
} from './CredentialItemFormFields';

type CredentialItemFormProps = {
  idPrefix?: string;
  initialValues?: Partial<CredentialItemFormValues>;
  resetKey?: string;
  requirePassword?: boolean;
  requireDirty?: boolean;
  canSubmitExtra?: boolean;
  extraFieldsBeforeNotes?: ReactNode;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  passwordHelpText?: string;
  submitLabel: string;
  submittingLabel: string;
  submitErrorMessage: string;
  cancelLabel?: string;
  resetAfterSubmit?: boolean;
  onCancel?: () => void;
  onSubmit: (values: CredentialItemFormValues) => Promise<void> | void;
};

export function CredentialItemForm({
  idPrefix = 'credential',
  initialValues,
  resetKey,
  requirePassword = false,
  requireDirty = false,
  canSubmitExtra = true,
  extraFieldsBeforeNotes,
  passwordLabel = 'Password',
  passwordPlaceholder = 'Enter password',
  passwordHelpText = 'Password will be encrypted before it is saved.',
  submitLabel,
  submittingLabel,
  submitErrorMessage,
  cancelLabel = 'Cancel',
  resetAfterSubmit = false,
  onCancel,
  onSubmit,
}: CredentialItemFormProps) {
  const initialFormState = getCredentialItemFormState(initialValues);

  const [title, setTitle] = useState(initialFormState.title);
  const [username, setUsername] = useState(initialFormState.username);
  const [password, setPassword] = useState(initialFormState.password);
  const [website, setWebsite] = useState(initialFormState.website);
  const [notes, setNotes] = useState(initialFormState.notes);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const websiteError = getCredentialWebsiteValidationError(website);

  const currentValues = normalizeCredentialItemFormValues({
    title,
    username,
    password,
    website,
    notes,
  });

  const normalizedInitialValues =
    normalizeCredentialItemFormValues(initialFormState);

  const isDirty = !areCredentialItemFormValuesEqual(
    currentValues,
    normalizedInitialValues,
  );

  const canSubmit =
    currentValues.title.length > 0 &&
    !websiteError &&
    (!requirePassword || password.length > 0) &&
    (!requireDirty || isDirty) &&
    canSubmitExtra &&
    !isSubmitting;

  useEffect(() => {
    const nextInitialFormState = getCredentialItemFormState(initialValues);

    setTitle(nextInitialFormState.title);
    setUsername(nextInitialFormState.username);
    setPassword(nextInitialFormState.password);
    setWebsite(nextInitialFormState.website);
    setNotes(nextInitialFormState.notes);
    setIsPasswordVisible(false);
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [resetKey]);

  function resetForm() {
    const nextInitialFormState = getCredentialItemFormState(initialValues);

    setTitle(nextInitialFormState.title);
    setUsername(nextInitialFormState.username);
    setPassword(nextInitialFormState.password);
    setWebsite(nextInitialFormState.website);
    setNotes(nextInitialFormState.notes);
    setIsPasswordVisible(false);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit(currentValues);

      if (resetAfterSubmit) {
        resetForm();
      }
    } catch {
      setErrorMessage(submitErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CredentialItemTextField
        id={`${idPrefix}-title`}
        label="Title"
        value={title}
        onChange={setTitle}
        placeholder="Binance"
        autoFocus
      />

      <CredentialItemTextField
        id={`${idPrefix}-username`}
        label="Username or email"
        value={username}
        onChange={setUsername}
        placeholder="name@example.com"
        autoComplete="username"
      />

      <CredentialItemPasswordField
        id={`${idPrefix}-password`}
        label={passwordLabel}
        value={password}
        onChange={setPassword}
        placeholder={passwordPlaceholder}
        helpText={passwordHelpText}
        isVisible={isPasswordVisible}
        onToggleVisible={() => setIsPasswordVisible((value) => !value)}
      />

      <CredentialItemTextField
        id={`${idPrefix}-website`}
        label="Website"
        value={website}
        onChange={setWebsite}
        placeholder="https://example.com"
        autoComplete="url"
        errorMessage={websiteError}
      />

      {extraFieldsBeforeNotes}

      <CredentialItemTextareaField
        id={`${idPrefix}-notes`}
        label="Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Encrypted notes..."
        rows={4}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex gap-2 border-t pt-4">
        <Button className="flex-1" type="submit" disabled={!canSubmit}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>

        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
