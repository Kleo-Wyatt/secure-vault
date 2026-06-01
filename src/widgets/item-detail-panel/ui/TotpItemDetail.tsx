import type { VaultItemDetail } from '@/entities/item';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type TotpItem = Extract<VaultItemDetail, { type: 'totp' }>;

type TotpItemDetailProps = {
  item: TotpItem;
};

export function TotpItemDetail({ item }: TotpItemDetailProps) {
  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Code generation is next</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The encrypted TOTP secret is saved. The next step will generate
              one-time codes from it.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
