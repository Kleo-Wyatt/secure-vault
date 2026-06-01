import type { VaultItemDetail } from '@/entities/item';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { useTotpItemDetail } from '../model/useTotpItemDetail';
import { TotpCodeSection } from './TotpCodeSection';

type TotpItem = Extract<VaultItemDetail, { type: 'totp' }>;

type TotpItemDetailProps = {
  item: TotpItem;
};

export function TotpItemDetail({ item }: TotpItemDetailProps) {
  const { code, expiresIn, isLoadingCode, codeError, refreshCode } =
    useTotpItemDetail({
      itemId: item.id,
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
            codeError={codeError}
            onRetryCode={refreshCode}
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
        </CardContent>
      </Card>
    </section>
  );
}
