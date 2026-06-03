import { useState, type ComponentType } from 'react';
import { KeyRound, LockKeyhole, NotebookText, ShieldCheck } from 'lucide-react';

import {
  LEGACY_CREDENTIAL_ITEM_TYPE,
  type VaultItemType,
} from '@/entities/item';
import type {
  CreateCredentialItemInput,
  CreateTotpItemInput,
} from '@/features/create-item/model/types';
import { CreateCredentialItemForm } from '@/features/create-item/ui/CreateCredentialItemForm';
import { CreateTotpItemForm } from '@/features/create-item/ui/CreateTotpItemForm';
import type { VaultList } from '@/features/vault-lists';
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
  selectedVaultList?: VaultList;
  onSelectType?: (type: VaultItemType) => void;
  onCreateCredential?: (
    input: CreateCredentialItemInput,
  ) => Promise<void> | void;
  onCreateTotp?: (input: CreateTotpItemInput) => Promise<void> | void;
};

const itemTypes: Array<{
  type: VaultItemType;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    type: LEGACY_CREDENTIAL_ITEM_TYPE,
    title: 'Credential',
    description: 'Store username, password, website, 2FA and notes.',
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
  if (selectedType === LEGACY_CREDENTIAL_ITEM_TYPE) {
    return 'Create credential';
  }

  if (selectedType === 'totp') {
    return 'Create TOTP';
  }

  return 'Create new item';
}

function getDialogDescription(selectedType: VaultItemType | null) {
  if (selectedType === LEGACY_CREDENTIAL_ITEM_TYPE) {
    return 'Add account credentials and optional security details.';
  }

  if (selectedType === 'totp') {
    return 'Add a standalone two-factor authentication secret.';
  }

  return 'Choose what kind of encrypted item you want to store.';
}

function getAvailableItemTypes(selectedVaultList?: VaultList) {
  if (!selectedVaultList) {
    return [];
  }

  const { template } = selectedVaultList;

  if (template.kind === 'credentials') {
    return itemTypes.filter((itemType) => {
      if (template.credentials && itemType.type === LEGACY_CREDENTIAL_ITEM_TYPE) {
        return true;
      }

      if (!template.credentials && template.totp && itemType.type === 'totp') {
        return true;
      }

      return false;
    });
  }

  if (template.kind === 'seed_phrase') {
    return itemTypes.filter((itemType) => itemType.type === 'seed_phrase');
  }

  if (template.kind === 'secure_note') {
    return itemTypes.filter((itemType) => itemType.type === 'secure_note');
  }

  return [];
}

export function CreateItemDialog({
  selectedVaultList,
  onSelectType,
  onCreateCredential,
  onCreateTotp,
}: CreateItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VaultItemType | null>(null);

  const availableItemTypes = getAvailableItemTypes(selectedVaultList);

  const includeTotpInCredentialForm  =
    selectedVaultList?.template.kind === 'credentials' &&
    selectedVaultList.template.credentials &&
    selectedVaultList.template.totp;

  function handleSelectType(type: VaultItemType) {
    setSelectedType(type);
    onSelectType?.(type);
  }

  function handleClose() {
    setIsOpen(false);
    setSelectedType(null);
  }

  function renderContent() {
    if (selectedType === LEGACY_CREDENTIAL_ITEM_TYPE) {
      return (
        <CreateCredentialItemForm
          includeTotp={includeTotpInCredentialForm }
          onBack={() => setSelectedType(null)}
          onCreate={async (input) => {
            await onCreateCredential?.(input);
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
        {selectedVaultList ? (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Creating item in “{selectedVaultList.name}”.
          </div>
        ) : null}

        {availableItemTypes.length > 0 ? (
          availableItemTypes.map((itemType) => {
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
          })
        ) : (
          <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            This list type does not have an item creation flow yet.
          </p>
        )}
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
