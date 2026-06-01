import { ArrowLeft } from 'lucide-react';

import { LoginItemForm, type LoginItemFormValues } from '@/entities/item';
import type { CreateLoginItemInput } from '@/features/create-item/model/types';
import { Button } from '@/shared/ui/button';

type CreateLoginItemFormProps = {
  onBack: () => void;
  onCreate: (input: CreateLoginItemInput) => Promise<void> | void;
};

export function CreateLoginItemForm({
  onBack,
  onCreate,
}: CreateLoginItemFormProps) {
  async function handleCreate(values: LoginItemFormValues) {
    const password = values.password ?? '';

    if (!password) {
      return;
    }

    await onCreate({
      title: values.title,
      username: values.username,
      password,
      website: values.website,
      notes: values.notes,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <LoginItemForm
        idPrefix="create-login"
        resetKey="create-login"
        requirePassword
        submitLabel="Create login"
        submittingLabel="Creating..."
        submitErrorMessage="Could not create login item."
        cancelLabel="Cancel"
        resetAfterSubmit
        onCancel={onBack}
        onSubmit={handleCreate}
      />
    </div>
  );
}
