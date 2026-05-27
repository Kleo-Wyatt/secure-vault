import { AlertTriangle, ShieldCheck } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type ItemDetailPanelProps = {
  item?: VaultItemDetail;
};

export function ItemDetailPanel({ item }: ItemDetailPanelProps) {
  if (!item) {
    return (
      <section className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No item selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Select an item from the list to view encrypted details.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'login') {
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
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded-md bg-muted px-2 py-1 text-sm">
                  {item.passwordMasked}
                </code>
                <Button variant="outline" size="sm">
                  Copy 20s
                </Button>
                <Button variant="ghost" size="sm">
                  Reveal
                </Button>
              </div>
            </div>

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
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'totp') {
    return (
      <section className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground">Issuer</p>
              <p className="text-sm">{item.issuer}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Account</p>
              <p className="text-sm">{item.account}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Code</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="text-3xl font-semibold tracking-widest">
                  {item.code}
                </code>
                <span className="text-xs text-muted-foreground">
                  {item.expiresIn}s left
                </span>
              </div>
            </div>

            <Button variant="outline">Copy code</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'seed_phrase') {
    return (
      <section className="p-6">
        <Card className="max-w-2xl border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              {item.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium">High security item</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This seed phrase can move all funds in the wallet. It is hidden
                by default and should only be revealed when absolutely needed.
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Wallet</p>
              <p className="text-sm">{item.walletName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="text-sm">{item.wordCount}</p>
            </div>

            {item.derivationPath ? (
              <div>
                <p className="text-xs text-muted-foreground">Derivation path</p>
                <code className="text-sm">{item.derivationPath}</code>
              </div>
            ) : null}

            <div>
              <p className="text-xs text-muted-foreground">Passphrase</p>
              <p className="text-sm">
                {item.passphraseStored ? 'Stored' : 'Not stored'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="destructive">Reveal word by word</Button>
              <Button variant="outline">Verify backup</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            {item.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Secure note</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.bodyPreview}
            </p>
          </div>

          <Button variant="outline">Reveal note</Button>
        </CardContent>
      </Card>
    </section>
  );
}
