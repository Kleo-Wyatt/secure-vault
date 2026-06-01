import { Trash2 } from 'lucide-react';

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

import { useTotpItemDetail } from '../model/useTotpItemDetail';
import { TotpCodeSection } from './TotpCodeSection';

type TotpItem = Extract<VaultItemDetail, { type: 'totp' }>;

type TotpItemDetailProps = {
  item: TotpItem;
  onItemDeleted?: (id: string) => void | Promise<void>;
};

export function TotpItemDetail({ item, onItemDeleted }: TotpItemDetailProps) {
  const {
    code,
    expiresIn,
    isLoadingCode,
    isCopyingCode,
    isDeletingItem,
    codeError,
    copyMessage,
    deleteError,
    refreshCode,
    handleCopyCode,
    handleDeleteTotpItem,
  } = useTotpItemDetail({
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
          <TotpCodeSection
            code={code}
            expiresIn={expiresIn}
            isLoadingCode={isLoadingCode}
            isCopyingCode={isCopyingCode}
            codeError={codeError}
            copyMessage={copyMessage}
            onRetryCode={refreshCode}
            onCopyCode={handleCopyCode}
          />

          {item.issuer ? (
            <div>
              <p className="text-xs text-muted-foreground">Issuer</p>
              <p className="text-sm">{item.issuer}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs text-muted-foreground">Account</p>
            <p className="text-sm">{item.account || 'Not set'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Algorithm</p>
            <p className="text-sm">{item.algorithm || 'SHA1'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Digits</p>
            <p className="text-sm">{item.digits ?? 6}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Period</p>
            <p className="text-sm">{item.period ?? 30}s</p>
          </div>

          {item.notes ? (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
            </div>
          ) : null}

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingItem}>
                  <Trash2 className="size-4" />
                  {isDeletingItem ? 'Deleting...' : 'Delete TOTP'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete TOTP item?</AlertDialogTitle>
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
                    onClick={() => handleDeleteTotpItem(item.id)}
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
