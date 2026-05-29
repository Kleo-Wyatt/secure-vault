import { Pencil } from 'lucide-react';
import { useState } from 'react';

import {
  LoginItemForm,
  type LoginItemFormValues,
  type VaultItemDetail,
} from '@/entities/item';
import { updateLoginItem } from '@/features/update-item/api/updateItem';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type LoginItem = Extract<VaultItemDetail, { type: 'login' }>;

type EditLoginItemDialogProps = {
  item: LoginItem;
  onUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function EditLoginItemDialog({
  item,
  onUpdated,
}: EditLoginItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdate(values: LoginItemFormValues) {
    const updatedItem = await updateLoginItem(item.id, {
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
          <DialogTitle>Edit login</DialogTitle>
          <DialogDescription>
            Update login metadata or enter a new password. Leave password empty
            to keep the current one.
          </DialogDescription>
        </DialogHeader>

        <LoginItemForm
          initialValues={{
            title: item.title,
            username: item.username,
            website: item.website,
            notes: item.notes,
          }}
          resetKey={`${item.id}:${isOpen ? 'open' : 'closed'}`}
          passwordLabel="New password"
          passwordPlaceholder="Leave empty to keep current password"
          passwordHelpText="The existing password is not loaded into the form."
          submitLabel="Save changes"
          submittingLabel="Saving..."
          submitErrorMessage="Could not update login item."
          cancelLabel="Cancel"
          onCancel={() => setIsOpen(false)}
          onSubmit={handleUpdate}
        />
      </DialogContent>
    </Dialog>
  );
}
