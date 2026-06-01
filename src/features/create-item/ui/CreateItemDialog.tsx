import { useState, type ComponentType } from 'react';
import { KeyRound, LockKeyhole, NotebookText, ShieldCheck } from 'lucide-react';

import type { VaultItemType } from '@/entities/item';
import type {
  CreateLoginItemInput,
  CreateTotpItemInput,
} from '@/features/create-item/model/types';
import { CreateLoginItemForm } from '@/features/create-item/ui/CreateLoginItemForm';
import { CreateTotpItemForm } from '@/features/create-item/ui/CreateTotpItemForm';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type CreateItemDialogProps = {
  onSelectType?: (type: VaultItemType) => void;
  onCreateLogin?: (input: CreateLoginItemInput) => Promise<void> | void;
  onCreateTotp?: (input: CreateTotpItemInput) => Promise<void> | void;
};

const itemTypes: Array<{
  type: VaultItemType;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    type: 'login',
    title: 'Login',
    description: 'Store username, password, website and notes.',
    icon: KeyRound,
  },
  {
    type: 'totp',
    title: 'TOTP',
    description: 'Store a 2FA secret and generate one-time codes.',
    icon: ShieldCheck,
  },
  {
    type: 'seed_phrase',
    title: 'Seed phrase',
    description: 'Store a wallet recovery phrase as a high-security item.',
    icon: LockKeyhole,
  },
  {
    type: 'secure_note',
    title: 'Secure note',
    description: 'Store encrypted notes and recovery instructions.',
    icon: NotebookText,
  },
];

function getDialogTitle(selectedType: VaultItemType | null) {
  if (selectedType === 'login') {
    return 'Create login';
  }

  if (selectedType === 'totp') {
    return 'Create TOTP';
  }

  return 'Create new item';
}

function getDialogDescription(selectedType: VaultItemType | null) {
  if (selectedType === 'login') {
    return 'Add credentials for an account or exchange.';
  }

  if (selectedType === 'totp') {
    return 'Add a two-factor authentication secret.';
  }

  return 'Choose what kind of encrypted item you want to store.';
}

export function CreateItemDialog({
  onSelectType,
  onCreateLogin,
  onCreateTotp,
}: CreateItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VaultItemType | null>(null);

  function handleSelectType(type: VaultItemType) {
    setSelectedType(type);
    onSelectType?.(type);
  }

  function handleClose() {
    setIsOpen(false);
    setSelectedType(null);
  }

  function renderContent() {
    if (selectedType === 'login') {
      return (
        <CreateLoginItemForm
          onBack={() => setSelectedType(null)}
          onCreate={async (input) => {
            await onCreateLogin?.(input);
            handleClose();
          }}
        />
      );
    }

    if (selectedType === 'totp') {
      return (
        <CreateTotpItemForm
          onBack={() => setSelectedType(null)}
          onCreate={async (input) => {
            await onCreateTotp?.(input);
            handleClose();
          }}
        />
      );
    }

    if (selectedType) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This item type will be implemented next.
          </p>

          <Button variant="outline" onClick={() => setSelectedType(null)}>
            Back
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-2">
        {itemTypes.map((itemType) => {
          const Icon = itemType.icon;

          return (
            <button
              key={itemType.type}
              type="button"
              className="flex gap-3 rounded-xl border p-4 text-left transition hover:bg-muted/60"
              onClick={() => handleSelectType(itemType.type)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5" />
              </div>

              <div>
                <p className="text-sm font-medium">{itemType.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {itemType.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);

        if (!nextOpen) {
          setSelectedType(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Create item">
          +
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle(selectedType)}</DialogTitle>
          <DialogDescription>
            {getDialogDescription(selectedType)}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
