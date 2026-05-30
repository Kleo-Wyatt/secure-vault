import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

export type LoginItemFormValues = {
  title: string;
  username?: string;
  password?: string;
  website?: string;
  notes?: string;
};

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

function normalizeInitialValue(value?: string) {
  return value ?? '';
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

function normalizeFormValues(values: LoginItemFormValues): LoginItemFormValues {
  return {
    title: values.title.trim(),
    username: values.username
      ? normalizeOptionalText(values.username)
      : undefined,
    password: values.password || undefined,
    website: values.website ? normalizeOptionalText(values.website) : undefined,
    notes: values.notes ? normalizeOptionalText(values.notes) : undefined,
  };
}

function areFormValuesEqual(
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
  const [title, setTitle] = useState(() =>
    normalizeInitialValue(initialValues?.title),
  );
  const [username, setUsername] = useState(() =>
    normalizeInitialValue(initialValues?.username),
  );
  const [password, setPassword] = useState(() =>
    normalizeInitialValue(initialValues?.password),
  );
  const [website, setWebsite] = useState(() =>
    normalizeInitialValue(initialValues?.website),
  );
  const [notes, setNotes] = useState(() =>
    normalizeInitialValue(initialValues?.notes),
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentValues = normalizeFormValues({
    title,
    username,
    password,
    website,
    notes,
  });

  const normalizedInitialValues = normalizeFormValues({
    title: normalizeInitialValue(initialValues?.title),
    username: normalizeInitialValue(initialValues?.username),
    password: normalizeInitialValue(initialValues?.password),
    website: normalizeInitialValue(initialValues?.website),
    notes: normalizeInitialValue(initialValues?.notes),
  });

  const isDirty = !areFormValuesEqual(currentValues, normalizedInitialValues);

  const canSubmit =
    currentValues.title.length > 0 &&
    (!requirePassword || password.length > 0) &&
    (!requireDirty || isDirty) &&
    !isSubmitting;

  useEffect(() => {
    setTitle(normalizeInitialValue(initialValues?.title));
    setUsername(normalizeInitialValue(initialValues?.username));
    setPassword(normalizeInitialValue(initialValues?.password));
    setWebsite(normalizeInitialValue(initialValues?.website));
    setNotes(normalizeInitialValue(initialValues?.notes));
    setIsPasswordVisible(false);
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [resetKey]);

  function resetForm() {
    setTitle(normalizeInitialValue(initialValues?.title));
    setUsername(normalizeInitialValue(initialValues?.username));
    setPassword(normalizeInitialValue(initialValues?.password));
    setWebsite(normalizeInitialValue(initialValues?.website));
    setNotes(normalizeInitialValue(initialValues?.notes));
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
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-title">
          Title
        </label>
        <Input
          id="login-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Binance"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-username">
          Username or email
        </label>
        <Input
          id="login-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="name@example.com"
          autoComplete="username"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-password">
          {passwordLabel}
        </label>

        <div className="flex gap-2">
          <Input
            id="login-password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={passwordPlaceholder}
            autoComplete="new-password"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((value) => !value)}
          >
            {isPasswordVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{passwordHelpText}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-website">
          Website
        </label>
        <Input
          id="login-website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://example.com"
          autoComplete="url"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-notes">
          Notes
        </label>
        <Textarea
          id="login-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Encrypted notes..."
          rows={4}
        />
      </div>

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
