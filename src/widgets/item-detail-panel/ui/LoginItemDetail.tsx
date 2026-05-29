import { Trash2 } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
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
  onDeleteLoginItem: (id: string, title: string) => void;
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
}: LoginItemDetailProps) {
  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm">{item.username}</p>
          </div>

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
            <p className="mt-2 text-xs text-muted-foreground">{copyMessage}</p>
          ) : null}

          {item.totpCode ? (
            <div>
              <p className="text-xs text-muted-foreground">TOTP</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="text-2xl font-semibold tracking-widest">
                  {item.totpCode}
                </code>
                <span className="text-xs text-muted-foreground">
                  {item.totpExpiresIn}s left
                </span>
              </div>
            </div>
          ) : null}

          {item.notes ? (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">Danger zone</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Delete this login item from the encrypted vault. This action
              cannot be undone.
            </p>

            <Button
              className="mt-3"
              variant="destructive"
              size="sm"
              onClick={() => onDeleteLoginItem(item.id, item.title)}
              disabled={isDeletingItem}
            >
              <Trash2 className="mr-2 size-4" />
              {isDeletingItem ? 'Deleting...' : 'Delete login'}
            </Button>

            {deleteError ? (
              <p className="mt-2 text-xs text-destructive">{deleteError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
