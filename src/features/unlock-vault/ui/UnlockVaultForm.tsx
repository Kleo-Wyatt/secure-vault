import { useState } from 'react';

import { unlockVault } from '@/features/unlock-vault/api/unlockVault';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

type UnlockVaultFormProps = {
  onCreateVault: () => void;
  onUnlocked: () => void;
};

export function UnlockVaultForm({
  onCreateVault,
  onUnlocked,
}: UnlockVaultFormProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = masterPassword.length > 0 && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await unlockVault({
        masterPassword,
      });

      setSuccessMessage(result.message);
      setMasterPassword('');
      onUnlocked();
    } catch {
      setErrorMessage('Could not unlock vault.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Unlock Secure Vault</CardTitle>
        <CardDescription>
          Enter your master password to decrypt your local vault.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="unlock-password">
              Master password
            </label>
            <Input
              id="unlock-password"
              type="password"
              autoComplete="current-password"
              value={masterPassword}
              onChange={(event) => setMasterPassword(event.target.value)}
              placeholder="Enter master password"
              autoFocus
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          ) : null}

          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Unlocking...' : 'Unlock vault'}
          </Button>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCreateVault}>
              Create new vault
            </Button>

            <p className="text-xs text-muted-foreground">
              Your master password is never stored and cannot be restored.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
