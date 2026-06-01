import { ShieldCheck } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type SecureNoteItem = Extract<VaultItemDetail, { type: 'secure_note' }>;

type SecureNoteDetailProps = {
  item: SecureNoteItem;
};

export function SecureNoteDetail({ item }: SecureNoteDetailProps) {
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
