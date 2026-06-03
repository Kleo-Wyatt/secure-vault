import { Trash2 } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { EditSecureNoteItemDialog } from '@/features/update-item';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { useSecureNoteDetail } from '../model/useSecureNoteDetail';

type SecureNoteItem = Extract<VaultItemDetail, { type: 'secure_note' }>;

type SecureNoteDetailProps = {
  item: SecureNoteItem;
  onItemDeleted?: (id: string) => void | Promise<void>;
  onItemUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function SecureNoteDetail({
  item,
  onItemDeleted,
  onItemUpdated,
}: SecureNoteDetailProps) {
  const {
    revealedBody,
    isRevealingBody,
    isDeletingItem,
    revealError,
    deleteError,
    handleRevealBody,
    hideBody,
    handleDeleteSecureNoteItem,
  } = useSecureNoteDetail({
    itemId: item.id,
    onItemDeleted,
  });

  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle>{item.title}</CardTitle>

            <EditSecureNoteItemDialog
              item={item}
              onUpdated={async (updatedItem) => {
                hideBody();
                await onItemUpdated?.(updatedItem);
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">Note</p>

            {revealedBody ? (
              <div
                className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/40 px-3 py-2 text-sm selection:bg-primary selection:text-primary-foreground"
                role="textbox"
                aria-label="Revealed secure note"
              >
                {revealedBody}
              </div>
            ) : (
              <code className="mt-2 block rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                {item.bodyPreview || 'Hidden until reveal.'}
              </code>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {revealedBody ? (
                <Button variant="ghost" size="sm" onClick={hideBody}>
                  Hide
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevealBody(item.id)}
                  disabled={isRevealingBody}
                >
                  {isRevealingBody ? 'Revealing...' : 'Reveal'}
                </Button>
              )}
            </div>

            {revealError ? (
              <p className="mt-2 text-xs text-destructive">{revealError}</p>
            ) : null}
          </div>

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingItem}>
                  <Trash2 className="size-4" />
                  {isDeletingItem ? 'Deleting...' : 'Delete note'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete secure note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Delete “{item.title}”? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingItem}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeletingItem}
                    onClick={() => handleDeleteSecureNoteItem(item.id)}
                  >
                    {isDeletingItem ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {deleteError ? (
              <p className="mt-2 text-xs text-destructive">{deleteError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
