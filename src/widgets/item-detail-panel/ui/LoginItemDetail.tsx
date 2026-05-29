import { Trash2 } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { EditLoginItemDialog } from '@/features/update-item';
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

type LoginItem = Extract<VaultItemDetail, { type: 'login' }>;

type LoginItemDetailProps = {
  item: LoginItem;
  revealedPassword: string | null;
  isRevealingPassword: boolean;
  isCopyingPassword: boolean;
  isDeletingItem: boolean;
  revealError: string | null;
  copyMessage: string | null;
  deleteError: string | null;
  onRevealPassword: (id: string) => void;
  onHidePassword: () => void;
  onCopyPassword: (id: string) => void;
  onDeleteLoginItem: (id: string) => void;
  onItemUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function LoginItemDetail({
  item,
  revealedPassword,
  isRevealingPassword,
  isCopyingPassword,
  isDeletingItem,
  revealError,
  copyMessage,
  deleteError,
  onRevealPassword,
  onHidePassword,
  onCopyPassword,
  onDeleteLoginItem,
  onItemUpdated,
}: LoginItemDetailProps) {
  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle>{item.title}</CardTitle>
          <EditLoginItemDialog item={item} onUpdated={onItemUpdated} />
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm">{item.username || 'Not set'}</p>
          </div>

          {item.website ? (
            <div>
              <p className="text-xs text-muted-foreground">Website</p>
              <p className="text-sm">{item.website}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs text-muted-foreground">Password</p>

            {revealedPassword ? (
              <input
                className="mt-2 h-10 w-full rounded-lg border bg-muted/40 px-3 font-mono text-sm outline-none selection:bg-primary selection:text-primary-foreground"
                value={revealedPassword}
                spellCheck={false}
                readOnly
                aria-label="Revealed password"
                onFocus={(event) => event.currentTarget.select()}
              />
            ) : (
              <code className="mt-2 block rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm">
                {item.passwordMasked}
              </code>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {revealedPassword ? (
                <Button variant="ghost" size="sm" onClick={onHidePassword}>
                  Hide
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevealPassword(item.id)}
                  disabled={isRevealingPassword}
                >
                  {isRevealingPassword ? 'Revealing...' : 'Reveal'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyPassword(item.id)}
                disabled={isCopyingPassword}
              >
                {isCopyingPassword ? 'Copying...' : 'Copy'}
              </Button>
            </div>

            {revealedPassword ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Password will be hidden automatically after 20 seconds. Focus
                the field to select and copy the full value.
              </p>
            ) : null}

            {revealError ? (
              <p className="mt-2 text-xs text-destructive">{revealError}</p>
            ) : null}
          </div>

          {copyMessage ? (
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {copyMessage}
            </p>
          ) : null}

          {item.notes ? (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm">{item.notes}</p>
            </div>
          ) : null}

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingItem}>
                  <Trash2 className="size-4" />
                  {isDeletingItem ? 'Deleting...' : 'Delete login'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete login item?</AlertDialogTitle>
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
                    onClick={() => onDeleteLoginItem(item.id)}
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
