import { useEffect, useState, type FormEvent } from 'react';

import {
  areLoginItemFormValuesEqual,
  getLoginItemFormState,
  normalizeLoginItemFormValues,
  type LoginItemFormValues,
} from '@/entities/item/model/loginItemForm';
import { Button } from '@/shared/ui/button';

import {
  LoginItemPasswordField,
  LoginItemTextareaField,
  LoginItemTextField,
} from './LoginItemFormFields';

type LoginItemFormProps = {
  initialValues?: Partial<LoginItemFormValues>;
  resetKey?: string;
  requirePassword?: boolean;
  requireDirty?: boolean;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  passwordHelpText?: string;
  submitLabel: string;
  submittingLabel: string;
  submitErrorMessage: string;
  cancelLabel?: string;
  resetAfterSubmit?: boolean;
  onCancel?: () => void;
  onSubmit: (values: LoginItemFormValues) => Promise<void> | void;
};

export function LoginItemForm({
  initialValues,
  resetKey,
  requirePassword = false,
  requireDirty = false,
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
}: LoginItemFormProps) {
  const initialFormState = getLoginItemFormState(initialValues);

  const [title, setTitle] = useState(initialFormState.title);
  const [username, setUsername] = useState(initialFormState.username);
  const [password, setPassword] = useState(initialFormState.password);
  const [website, setWebsite] = useState(initialFormState.website);
  const [notes, setNotes] = useState(initialFormState.notes);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentValues = normalizeLoginItemFormValues({
    title,
    username,
    password,
    website,
    notes,
  });

  const normalizedInitialValues =
    normalizeLoginItemFormValues(initialFormState);

  const isDirty = !areLoginItemFormValuesEqual(
    currentValues,
    normalizedInitialValues,
  );

  const canSubmit =
    currentValues.title.length > 0 &&
    (!requirePassword || password.length > 0) &&
    (!requireDirty || isDirty) &&
    !isSubmitting;

  useEffect(() => {
    const nextInitialFormState = getLoginItemFormState(initialValues);

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
    const nextInitialFormState = getLoginItemFormState(initialValues);

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
      <LoginItemTextField
        id="login-title"
        label="Title"
        value={title}
        onChange={setTitle}
        placeholder="Binance"
        autoFocus
      />

      <LoginItemTextField
        id="login-username"
        label="Username or email"
        value={username}
        onChange={setUsername}
        placeholder="name@example.com"
        autoComplete="username"
      />

      <LoginItemPasswordField
        id="login-password"
        label={passwordLabel}
        value={password}
        onChange={setPassword}
        placeholder={passwordPlaceholder}
        helpText={passwordHelpText}
        isVisible={isPasswordVisible}
        onToggleVisible={() => setIsPasswordVisible((value) => !value)}
      />

      <LoginItemTextField
        id="login-website"
        label="Website"
        value={website}
        onChange={setWebsite}
        placeholder="https://example.com"
        autoComplete="url"
      />

      <LoginItemTextareaField
        id="login-notes"
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
