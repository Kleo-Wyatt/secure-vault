import { useState } from 'react';

import { createVault } from '@/features/create-vault/api/createVault';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

type CreateVaultFormProps = {
  onCancel: () => void;
  onCreated: () => void;
};

export function CreateVaultForm({ onCancel, onCreated }: CreateVaultFormProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch =
    masterPassword.length > 0 && masterPassword === confirmPassword;

  const canSubmit =
    masterPassword.length >= 12 &&
    passwordsMatch &&
    acceptedRisk &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await createVault({
        masterPassword,
      });

      setSuccessMessage(result.message);
      setMasterPassword('');
      setConfirmPassword('');
      setAcceptedRisk(false);
      onCreated();
    } catch {
      setErrorMessage('Could not create vault.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create encrypted vault</CardTitle>
        <CardDescription>
          Create a local vault protected by a master password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="master-password">
              Master password
            </label>
            <Input
              id="master-password"
              type="password"
              autoComplete="new-password"
              value={masterPassword}
              onChange={(event) => setMasterPassword(event.target.value)}
              placeholder="Enter master password"
            />
            <p className="text-xs text-muted-foreground">
              Use at least 12 characters. This password cannot be recovered.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="confirm-password">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat master password"
            />
            {confirmPassword.length > 0 && !passwordsMatch ? (
              <p className="text-xs text-destructive">
                Passwords do not match.
              </p>
            ) : null}
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              className="mt-1"
              type="checkbox"
              checked={acceptedRisk}
              onChange={(event) => setAcceptedRisk(event.target.checked)}
            />
            <span className="text-muted-foreground">
              I understand that if I forget this master password, my vault data
              cannot be recovered.
            </span>
          </label>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Creating...' : 'Create vault'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
