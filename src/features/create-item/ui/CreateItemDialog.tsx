import { useState, type ComponentType } from 'react';
import { KeyRound, LockKeyhole, NotebookText, ShieldCheck } from 'lucide-react';

import type { VaultItemType } from '@/entities/item';
import { CreateLoginItemForm } from '@/features/create-item/ui/CreateLoginItemForm';
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

export function CreateItemDialog({ onSelectType }: CreateItemDialogProps) {
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
          onCreated={handleClose}
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
          <DialogTitle>
            {selectedType === 'login' ? 'Create login' : 'Create new item'}
          </DialogTitle>
          <DialogDescription>
            {selectedType === 'login'
              ? 'Add credentials for an account or exchange.'
              : 'Choose what kind of encrypted item you want to store.'}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
