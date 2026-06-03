import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import {
  CredentialItemForm,
  type CredentialItemFormValues,
} from '@/entities/item';
import type {
  CreateCredentialItemInput,
  CreateCredentialItemTotpInput,
} from '@/features/create-item/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type CreateCredentialItemFormProps = {
  includeTotp?: boolean;
  onBack: () => void;
  onCreate: (input: CreateCredentialItemInput) => Promise<void> | void;
};

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

export function CreateCredentialItemForm({
  includeTotp = false,
  onBack,
  onCreate,
}: CreateCredentialItemFormProps) {
  const [totpSecret, setTotpSecret] = useState('');
  const [isTotpSecretVisible, setIsTotpSecretVisible] = useState(false);

  const totpSecretError = includeTotp
    ? getTotpSecretValidationError(totpSecret)
    : null;

  const shouldShowTotpSecretError =
    Boolean(totpSecret) && Boolean(totpSecretError);

  function getTotpInput(
    values: CredentialItemFormValues,
  ): CreateCredentialItemTotpInput | undefined {
    if (!includeTotp) {
      return undefined;
    }

    return {
      issuer: values.title,
      account: values.username,
      secret: normalizeTotpSecret(totpSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    };
  }

  async function handleCreate(values: CredentialItemFormValues) {
    const password = values.password ?? '';

    if (!password || totpSecretError) {
      return;
    }

    await onCreate({
      title: values.title,
      username: values.username,
      password,
      website: values.website,
      totp: getTotpInput(values),
      notes: values.notes,
    });

    setTotpSecret('');
    setIsTotpSecretVisible(false);
  }

  const totpFields = includeTotp ? (
    <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium">Two-factor authentication</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add the TOTP secret for this account. The secret will be encrypted
          with the rest of the item.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor="create-credential-totp-secret"
        >
          TOTP secret
        </label>

        <div className="flex gap-2">
          <Input
            id="create-credential-totp-secret"
            type={isTotpSecretVisible ? 'text' : 'password'}
            value={totpSecret}
            onChange={(event) => setTotpSecret(event.target.value)}
            placeholder="Base32 secret"
            autoComplete="off"
            aria-invalid={shouldShowTotpSecretError}
            aria-describedby={
              shouldShowTotpSecretError
                ? 'create-credential-totp-secret-error'
                : undefined
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

        {shouldShowTotpSecretError ? (
          <p
            id="create-credential-totp-secret-error"
            className="text-xs text-destructive"
          >
            {totpSecretError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Required for this list. Spaces are allowed.
          </p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <CredentialItemForm
        idPrefix="create-credential"
        resetKey="create-credential"
        requirePassword
        canSubmitExtra={!totpSecretError}
        extraFieldsBeforeNotes={totpFields}
        submitLabel="Create credential"
        submittingLabel="Creating..."
        submitErrorMessage="Could not create credential item."
        cancelLabel="Cancel"
        resetAfterSubmit
        onCancel={onBack}
        onSubmit={handleCreate}
      />
    </div>
  );
}
