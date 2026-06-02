import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { LoginItemForm, type LoginItemFormValues } from '@/entities/item';
import type {
  CreateLoginItemInput,
  CreateLoginItemTotpInput,
} from '@/features/create-item/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type CreateLoginItemFormProps = {
  includeTotp?: boolean;
  onBack: () => void;
  onCreate: (input: CreateLoginItemInput) => Promise<void> | void;
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

export function CreateLoginItemForm({
  includeTotp = false,
  onBack,
  onCreate,
}: CreateLoginItemFormProps) {
  const [totpIssuer, setTotpIssuer] = useState('');
  const [totpAccount, setTotpAccount] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [isTotpSecretVisible, setIsTotpSecretVisible] = useState(false);

  const totpSecretError = includeTotp
    ? getTotpSecretValidationError(totpSecret)
    : null;

  function getTotpInput(): CreateLoginItemTotpInput | undefined {
    if (!includeTotp) {
      return undefined;
    }

    return {
      issuer: normalizeOptionalText(totpIssuer),
      account: normalizeOptionalText(totpAccount),
      secret: normalizeTotpSecret(totpSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    };
  }

  async function handleCreate(values: LoginItemFormValues) {
    const password = values.password ?? '';

    if (!password || totpSecretError) {
      return;
    }

    await onCreate({
      title: values.title,
      username: values.username,
      password,
      website: values.website,
      totp: getTotpInput(),
      notes: values.notes,
    });

    setTotpIssuer('');
    setTotpAccount('');
    setTotpSecret('');
    setIsTotpSecretVisible(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      {includeTotp ? (
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          This item will include login credentials and a TOTP secret.
        </div>
      ) : null}

      <LoginItemForm
        idPrefix="create-login"
        resetKey="create-login"
        requirePassword
        submitLabel="Create login"
        submittingLabel="Creating..."
        submitErrorMessage="Could not create login item."
        cancelLabel="Cancel"
        resetAfterSubmit
        onCancel={onBack}
        onSubmit={handleCreate}
      />

      {includeTotp ? (
        <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium">TOTP</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a two-factor authentication secret to this credential.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="create-login-totp-issuer"
            >
              Issuer
            </label>
            <Input
              id="create-login-totp-issuer"
              value={totpIssuer}
              onChange={(event) => setTotpIssuer(event.target.value)}
              placeholder="Binance"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="create-login-totp-account"
            >
              Account
            </label>
            <Input
              id="create-login-totp-account"
              value={totpAccount}
              onChange={(event) => setTotpAccount(event.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="create-login-totp-secret"
            >
              TOTP secret
            </label>

            <div className="flex gap-2">
              <Input
                id="create-login-totp-secret"
                type={isTotpSecretVisible ? 'text' : 'password'}
                value={totpSecret}
                onChange={(event) => setTotpSecret(event.target.value)}
                placeholder="Base32 secret"
                autoComplete="off"
                aria-invalid={Boolean(totpSecretError)}
                aria-describedby={
                  totpSecretError ? 'create-login-totp-secret-error' : undefined
                }
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={
                  isTotpSecretVisible ? 'Hide TOTP secret' : 'Show TOTP secret'
                }
                onClick={() => setIsTotpSecretVisible((value) => !value)}
              >
                {isTotpSecretVisible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>

            {totpSecretError ? (
              <p
                id="create-login-totp-secret-error"
                className="text-xs text-destructive"
              >
                {totpSecretError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Spaces are allowed. The secret will be normalized before saving.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
