import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import type { CreateTotpItemInput } from '@/features/create-item';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CreateTotpItemFormProps = {
  onBack: () => void;
  onCreate: (input: CreateTotpItemInput) => Promise<void> | void;
};

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

function normalizeTotpSecret(value: string) {
  return value.replace(/\s/g, '').toUpperCase().replace(/=+$/g, '');
}

function getTotpSecretValidationError(value: string) {
  const normalizedSecret = normalizeTotpSecret(value);

  if (!normalizedSecret) {
    return 'TOTP secret is required.';
  }

  if (!/^[A-Z2-7]+$/.test(normalizedSecret)) {
    return 'Enter a valid base32 TOTP secret.';
  }

  return null;
}

export function CreateTotpItemForm({
  onBack,
  onCreate,
}: CreateTotpItemFormProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [secret, setSecret] = useState('');
  const [notes, setNotes] = useState('');
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const secretError = getTotpSecretValidationError(secret);

  const canSubmit =
    title.trim().length > 0 &&
    account.trim().length > 0 &&
    !secretError &&
    !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onCreate({
        title: title.trim(),
        issuer: normalizeOptionalText(issuer),
        account: account.trim(),
        secret: normalizeTotpSecret(secret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        notes: normalizeOptionalText(notes),
      });

      setTitle('');
      setIssuer('');
      setAccount('');
      setSecret('');
      setNotes('');
      setIsSecretVisible(false);
    } catch {
      setErrorMessage('Could not create TOTP item.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="create-totp-title">
            Title
          </label>
          <Input
            id="create-totp-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="GitHub 2FA"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="create-totp-issuer">
            Issuer
          </label>
          <Input
            id="create-totp-issuer"
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            placeholder="GitHub"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="create-totp-account">
            Account
          </label>
          <Input
            id="create-totp-account"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="name@example.com"
            autoComplete="username"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="create-totp-secret">
            TOTP secret
          </label>

          <div className="flex gap-2">
            <Input
              id="create-totp-secret"
              type={isSecretVisible ? 'text' : 'password'}
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="Base32 secret"
              autoComplete="off"
              aria-invalid={Boolean(secretError)}
              aria-describedby={
                secretError ? 'create-totp-secret-error' : undefined
              }
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={isSecretVisible ? 'Hide secret' : 'Show secret'}
              onClick={() => setIsSecretVisible((value) => !value)}
            >
              {isSecretVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>

          {secretError ? (
            <p
              id="create-totp-secret-error"
              className="text-xs text-destructive"
            >
              {secretError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Spaces are allowed. The secret will be normalized before saving.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="create-totp-notes">
            Notes
          </label>
          <Textarea
            id="create-totp-notes"
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
            {isSubmitting ? 'Creating...' : 'Create TOTP'}
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
