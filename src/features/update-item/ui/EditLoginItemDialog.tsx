import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
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
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type LoginItem = Extract<VaultItemDetail, { type: 'login' }>;

type EditLoginItemDialogProps = {
  item: LoginItem;
  onUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

function getInitialWebsite(item: LoginItem) {
  if (!item.description || item.description === 'Login') {
    return '';
  }

  return item.description;
}

export function EditLoginItemDialog({
  item,
  onUpdated,
}: EditLoginItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [username, setUsername] = useState(item.username ?? '');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState(getInitialWebsite(item));
  const [notes, setNotes] = useState(item.notes ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(item.title);
    setUsername(item.username ?? '');
    setPassword('');
    setWebsite(getInitialWebsite(item));
    setNotes(item.notes ?? '');
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [isOpen, item]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const updatedItem = await updateLoginItem(item.id, {
        title: title.trim(),
        username: username.trim() || undefined,
        password: password || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      await onUpdated?.(updatedItem);
      setIsOpen(false);
    } catch {
      setErrorMessage('Could not update login item.');
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
          <DialogTitle>Edit login</DialogTitle>
          <DialogDescription>
            Update login metadata or enter a new password. Leave password empty
            to keep the current one.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-login-title">
              Title
            </label>
            <Input
              id="edit-login-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Binance"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="edit-login-username"
            >
              Username or email
            </label>
            <Input
              id="edit-login-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="edit-login-password"
            >
              New password
            </label>
            <Input
              id="edit-login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave empty to keep current password"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              The existing password is not loaded into the form.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-login-website">
              Website
            </label>
            <Input
              id="edit-login-website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              autoComplete="url"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-login-notes">
              Notes
            </label>
            <Textarea
              id="edit-login-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Encrypted notes..."
              rows={4}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <div className="flex gap-2 border-t pt-4">
            <Button className="flex-1" type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
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
