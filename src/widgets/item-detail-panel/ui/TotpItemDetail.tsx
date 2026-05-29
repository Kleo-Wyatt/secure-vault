import type { VaultItemDetail } from '@/entities/item';
import { Button } from '@/shared/ui/button';
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
