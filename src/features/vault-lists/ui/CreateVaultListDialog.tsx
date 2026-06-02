import { useState, type FormEvent } from 'react';
import {
  CreditCard,
  KeyRound,
  NotebookText,
  Plus,
  WalletCards,
} from 'lucide-react';

import type {
  CreateVaultListInput,
  VaultListKind,
  VaultListTemplate,
} from '@/features/vault-lists';
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
import { cn } from '@/shared/lib/utils';

type CreateVaultListDialogProps = {
  onCreate: (input: CreateVaultListInput) => Promise<void> | void;
};

const listKindOptions: Array<{
  kind: VaultListKind;
  title: string;
  description: string;
  icon: typeof KeyRound;
}> = [
  {
    kind: 'credentials',
    title: 'Accounts and services',
    description: 'Poker rooms, shops, exchanges, apps, and websites.',
    icon: KeyRound,
  },
  {
    kind: 'seed_phrase',
    title: 'Cold crypto wallets',
    description: 'Wallet recovery phrases and related notes.',
    icon: WalletCards,
  },
  {
    kind: 'bank_card',
    title: 'Bank cards',
    description: 'Payment cards and banking details.',
    icon: CreditCard,
  },
  {
    kind: 'secure_note',
    title: 'Secure notes',
    description: 'Standalone encrypted notes.',
    icon: NotebookText,
  },
];

function getDefaultName(kind: VaultListKind) {
  switch (kind) {
    case 'credentials':
      return 'Accounts';
    case 'seed_phrase':
      return 'Cold crypto wallets';
    case 'bank_card':
      return 'Bank cards';
    case 'secure_note':
      return 'Secure notes';
  }
}

function buildTemplate(
  kind: VaultListKind,
  login: boolean,
  totp: boolean,
): VaultListTemplate {
  switch (kind) {
    case 'credentials':
      return {
        kind,
        login,
        totp,
        notes: true,
      };

    case 'seed_phrase':
    case 'bank_card':
      return {
        kind,
        login: false,
        totp: false,
        notes: true,
      };

    case 'secure_note':
      return {
        kind,
        login: false,
        totp: false,
        notes: false,
      };
  }
}

export function CreateVaultListDialog({
  onCreate,
}: CreateVaultListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<VaultListKind>('credentials');
  const [login, setLogin] = useState(true);
  const [totp, setTotp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCredentialsList = kind === 'credentials';
  const hasCredentialsField = !isCredentialsList || login || totp;
  const canSubmit =
    name.trim().length > 0 && hasCredentialsField && !isSubmitting;

  function resetForm() {
    setName('');
    setKind('credentials');
    setLogin(true);
    setTotp(false);
    setErrorMessage(null);
    setIsSubmitting(false);
  }

  function handleSelectKind(nextKind: VaultListKind) {
    setKind(nextKind);

    if (!name.trim()) {
      setName(getDefaultName(nextKind));
    }

    if (nextKind !== 'credentials') {
      setLogin(false);
      setTotp(false);
    } else {
      setLogin(true);
      setTotp(false);
    }
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
        template: buildTemplate(kind, login, totp),
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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create list</DialogTitle>
          <DialogDescription>
            Choose what this list is for. Notes are included automatically where
            needed.
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

          <div className="grid gap-2">
            {listKindOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = option.kind === kind;

              return (
                <button
                  key={option.kind}
                  type="button"
                  className={cn(
                    'flex gap-3 rounded-xl border p-3 text-left transition hover:bg-muted/60',
                    isSelected && 'bg-muted ring-2 ring-ring/40',
                  )}
                  onClick={() => handleSelectKind(option.kind)}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{option.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {isCredentialsList ? (
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">Credentials fields</p>

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

              {!hasCredentialsField ? (
                <p className="text-xs text-destructive">
                  Select login credentials, TOTP, or both.
                </p>
              ) : null}

              <p className="text-xs text-muted-foreground">
                Notes will be included automatically.
              </p>
            </div>
          ) : null}

          {kind === 'seed_phrase' || kind === 'bank_card' ? (
            <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Notes will be included automatically for this list.
            </p>
          ) : null}

          {kind === 'secure_note' ? (
            <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              This list will store standalone encrypted notes.
            </p>
          ) : null}

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
