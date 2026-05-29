import { AlertTriangle } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type SeedPhraseItem = Extract<VaultItemDetail, { type: 'seed_phrase' }>;

type SeedPhraseItemDetailProps = {
  item: SeedPhraseItem;
};

export function SeedPhraseItemDetail({ item }: SeedPhraseItemDetailProps) {
  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            {item.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              High-security item
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This seed phrase can move all funds in the wallet. It is hidden by
              default and should only be revealed when absolutely needed.
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Wallet</p>
            <p className="text-sm">{item.walletName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Word count</p>
            <p className="text-sm">{item.wordCount} words</p>
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
