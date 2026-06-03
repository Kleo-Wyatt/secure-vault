import { Eye, EyeOff, Trash2 } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
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
};

export function SecureNoteDetail({
  item,
  onItemDeleted,
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
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">Note</p>

            {revealedBody ? (
              <div className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
                {revealedBody}
              </div>
            ) : (
              <div className="mt-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                {item.bodyPreview || 'Hidden until reveal.'}
              </div>
            )}

            {revealError ? (
              <p className="mt-2 text-xs text-destructive">{revealError}</p>
            ) : null}

            <div className="mt-3 flex gap-2">
              {revealedBody ? (
                <Button type="button" variant="outline" onClick={hideBody}>
                  <EyeOff className="size-4" />
                  Hide note
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRevealingBody}
                  onClick={() => handleRevealBody(item.id)}
                >
                  <Eye className="size-4" />
                  {isRevealingBody ? 'Revealing...' : 'Reveal note'}
                </Button>
              )}
            </div>
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
