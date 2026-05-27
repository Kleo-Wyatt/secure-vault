import { Plus, Search } from 'lucide-react';

import type { VaultItemSummary } from '@/entities/item';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

type ItemListProps = {
  items: VaultItemSummary[];
  selectedItemId?: string;
  onSelectItem: (itemId: string) => void;
};

function getItemTypeLabel(type: VaultItemSummary['type']) {
  switch (type) {
    case 'login':
      return 'Login';
    case 'totp':
      return 'TOTP';
    case 'seed_phrase':
      return 'Seed phrase';
    case 'secure_note':
      return 'Secure note';
  }
}

export function ItemList({
  items,
  selectedItemId,
  onSelectItem,
}: ItemListProps) {
  return (
    <section className="border-r p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search items..." />
        </div>

        <Button size="icon" aria-label="Create item">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <button
              key={item.id}
              type="button"
              className="text-left"
              onClick={() => onSelectItem(item.id)}
            >
              <Card
                className={cn(
                  'cursor-pointer transition hover:bg-muted/40',
                  isSelected && 'bg-muted ring-2 ring-ring/40',
                )}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {getItemTypeLabel(item.type)}
                    {item.isHighSecurity ? ' · High security' : ''}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
