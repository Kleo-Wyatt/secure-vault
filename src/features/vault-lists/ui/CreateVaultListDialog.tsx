import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';

import type { CreateVaultListInput } from '@/features/vault-lists';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';

type CreateVaultListDialogProps = {
  onCreate: (input: CreateVaultListInput) => Promise<void> | void;
};

export function CreateVaultListDialog({
  onCreate,
}: CreateVaultListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [login, setLogin] = useState(true);
  const [totp, setTotp] = useState(false);
  const [notes, setNotes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasEnabledFieldGroup = login || totp || notes;
  const canSubmit =
    name.trim().length > 0 && hasEnabledFieldGroup && !isSubmitting;

  function resetForm() {
    setName('');
    setLogin(true);
    setTotp(false);
    setNotes(true);
    setErrorMessage(null);
    setIsSubmitting(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onCreate({
        name: name.trim(),
        template: {
          login,
          totp,
          notes,
        },
      });

      resetForm();
      setIsOpen(false);
    } catch {
      setErrorMessage('Could not create list.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);

        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Plus className="size-4" />
          New list
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create list</DialogTitle>
          <DialogDescription>
            Choose which field groups this list should use when creating items.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="vault-list-name">
              List name
            </label>
            <Input
              id="vault-list-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Crypto exchanges"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Fields</p>

            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={login}
                onChange={(event) => setLogin(event.target.checked)}
              />
              <span>
                <span className="font-medium">Login credentials</span>
                <span className="block text-xs text-muted-foreground">
                  Title, username, password, website.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={totp}
                onChange={(event) => setTotp(event.target.checked)}
              />
              <span>
                <span className="font-medium">TOTP</span>
                <span className="block text-xs text-muted-foreground">
                  Two-factor authentication code.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={notes}
                onChange={(event) => setNotes(event.target.checked)}
              />
              <span>
                <span className="font-medium">Notes</span>
                <span className="block text-xs text-muted-foreground">
                  Encrypted notes for this item.
                </span>
              </span>
            </label>

            {!hasEnabledFieldGroup ? (
              <p className="text-xs text-destructive">
                Select at least one field group.
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <div className="flex gap-2 border-t pt-4">
            <Button className="flex-1" type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Creating...' : 'Create list'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
