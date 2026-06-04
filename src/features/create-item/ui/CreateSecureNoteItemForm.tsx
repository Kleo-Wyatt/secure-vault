import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';

import type { CreateSecureNoteItemInput } from '@/features/create-item';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CreateSecureNoteItemFormProps = {
  onBack: () => void;
  onCreate: (input: CreateSecureNoteItemInput) => Promise<void> | void;
};

export function CreateSecureNoteItemForm({
  onBack,
  onCreate,
}: CreateSecureNoteItemFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    title.trim().length > 0 && body.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onCreate({
        title: title.trim(),
        body,
      });

      setTitle('');
      setBody('');
    } catch {
      setErrorMessage('Could not create secure note.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="create-secure-note-title"
          >
            Title
          </label>
          <Input
            id="create-secure-note-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Recovery instructions"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="create-secure-note-body"
          >
            Note
          </label>
          <Textarea
            id="create-secure-note-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write an encrypted note..."
            rows={8}
          />
          <p className="text-xs text-muted-foreground">
            The note body will be encrypted before it is saved.
          </p>
        </div>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <div className="flex gap-2 border-t pt-4">
          <Button className="flex-1" type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Creating...' : 'Create note'}
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
