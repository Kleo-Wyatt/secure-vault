import { Pencil } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import type { VaultItemDetail } from '@/entities/item';
import { revealSecret } from '@/features/reveal-secret';
import { updateSecureNoteItem } from '@/features/update-item/api/updateItem';
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
import { Textarea } from '@/shared/ui/textarea';

type SecureNoteItem = Extract<VaultItemDetail, { type: 'secure_note' }>;

type EditSecureNoteItemDialogProps = {
  item: SecureNoteItem;
  onUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function EditSecureNoteItemDialog({
  item,
  onUpdated,
}: EditSecureNoteItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState('');
  const [initialBody, setInitialBody] = useState('');
  const [isLoadingBody, setIsLoadingBody] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );

  const normalizedTitle = title.trim();
  const isDirty = normalizedTitle !== item.title || body !== initialBody;

  const canSubmit =
    normalizedTitle.length > 0 &&
    body.trim().length > 0 &&
    isDirty &&
    !isLoadingBody &&
    !isSubmitting;

  useEffect(() => {
    if (!isOpen) {
      setTitle(item.title);
      setBody('');
      setInitialBody('');
      setIsLoadingBody(false);
      setIsSubmitting(false);
      setLoadErrorMessage(null);
      setSubmitErrorMessage(null);
      return;
    }

    let isMounted = true;

    async function loadBody() {
      setTitle(item.title);
      setBody('');
      setInitialBody('');
      setIsLoadingBody(true);
      setLoadErrorMessage(null);
      setSubmitErrorMessage(null);

      try {
        const result = await revealSecret({
          id: item.id,
          secretType: 'secure_note_body',
        });

        if (!isMounted) {
          return;
        }

        setBody(result.value);
        setInitialBody(result.value);
      } catch {
        if (!isMounted) {
          return;
        }

        setLoadErrorMessage('Could not load secure note.');
      } finally {
        if (isMounted) {
          setIsLoadingBody(false);
        }
      }
    }

    void loadBody();

    return () => {
      isMounted = false;
    };
  }, [isOpen, item.id, item.title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitErrorMessage(null);
    setIsSubmitting(true);

    try {
      const updatedItem = await updateSecureNoteItem(item.id, {
        title: normalizedTitle,
        body,
      });

      await onUpdated?.(updatedItem);
      setIsOpen(false);
    } catch {
      setSubmitErrorMessage('Could not update secure note.');
    } finally {
      setIsSubmitting(false);
    }
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
          <DialogTitle>Edit secure note</DialogTitle>
          <DialogDescription>
            Update the note title or body. The body is loaded only while
            editing.
          </DialogDescription>
        </DialogHeader>

        {loadErrorMessage ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-destructive">{loadErrorMessage}</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor={`edit-secure-note-${item.id}-title`}
              >
                Title
              </label>
              <Input
                id={`edit-secure-note-${item.id}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Recovery instructions"
                disabled={isLoadingBody || isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor={`edit-secure-note-${item.id}-body`}
              >
                Note
              </label>
              <Textarea
                id={`edit-secure-note-${item.id}-body`}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={
                  isLoadingBody
                    ? 'Loading encrypted note...'
                    : 'Write an encrypted note...'
                }
                rows={8}
                disabled={isLoadingBody || isSubmitting}
              />
            </div>

            {submitErrorMessage ? (
              <p className="text-sm text-destructive">{submitErrorMessage}</p>
            ) : null}

            <div className="flex gap-2 border-t pt-4">
              <Button className="flex-1" type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
