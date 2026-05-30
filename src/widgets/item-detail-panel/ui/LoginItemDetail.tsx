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

import { LoginPasswordSection } from './LoginPasswordSection';

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

          <LoginPasswordSection
            passwordMasked={item.passwordMasked}
            revealedPassword={revealedPassword}
            isRevealingPassword={isRevealingPassword}
            isCopyingPassword={isCopyingPassword}
            revealError={revealError}
            onRevealPassword={() => onRevealPassword(item.id)}
            onHidePassword={onHidePassword}
            onCopyPassword={() => onCopyPassword(item.id)}
          />

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
