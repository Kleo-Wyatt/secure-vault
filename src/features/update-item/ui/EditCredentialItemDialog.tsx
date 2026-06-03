import { Pencil } from 'lucide-react';
import { useState } from 'react';

import {
  CredentialItemForm,
  type CredentialItemDetail,
  type CredentialItemFormValues,
  type VaultItemDetail,
} from '@/entities/item';
import { updateCredentialItem } from '@/features/update-item/api/updateItem';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type CredentialItem = CredentialItemDetail;

type EditCredentialItemDialogProps = {
  item: CredentialItem;
  onUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function EditCredentialItemDialog({
  item,
  onUpdated,
}: EditCredentialItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdate(values: CredentialItemFormValues) {
    const updatedItem = await updateCredentialItem(item.id, {
      title: values.title,
      username: values.username,
      password: values.password,
      website: values.website,
      notes: values.notes,
    });

    await onUpdated?.(updatedItem);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit credential</DialogTitle>
          <DialogDescription>
            Update credential metadata or enter a new password. Leave password
            empty to keep the current one.
          </DialogDescription>
        </DialogHeader>

        <CredentialItemForm
          idPrefix={`edit-credential-${item.id}`}
          initialValues={{
            title: item.title,
            username: item.username,
            website: item.website,
            notes: item.notes,
          }}
          resetKey={`${item.id}:${isOpen ? 'open' : 'closed'}`}
          requireDirty
          passwordLabel="New password"
          passwordPlaceholder="Leave empty to keep current password"
          passwordHelpText="The existing password is not loaded into the form."
          submitLabel="Save changes"
          submittingLabel="Saving..."
          submitErrorMessage="Could not update credential."
          cancelLabel="Cancel"
          onCancel={() => setIsOpen(false)}
          onSubmit={handleUpdate}
        />
      </DialogContent>
    </Dialog>
  );
}
