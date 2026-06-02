import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import type { VaultItemSummary } from '@/entities/item';
import {
  CreateItemDialog,
  type CreateLoginItemInput,
  type CreateTotpItemInput,
} from '@/features/create-item';
import type { VaultList } from '@/features/vault-lists';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

type ItemListProps = {
  items: VaultItemSummary[];
  selectedVaultList?: VaultList;
  selectedItemId?: string;
  onSelectItem: (itemId: string) => void;
  onCreateLogin: (input: CreateLoginItemInput) => void;
  onCreateTotp: (input: CreateTotpItemInput) => void;
};

function getItemTypeLabel(item: VaultItemSummary) {
  switch (item.type) {
    case 'login':
      return item.hasTotp ? 'Credential · 2FA' : 'Credential';
    case 'totp':
      return 'TOTP';
    case 'seed_phrase':
      return 'Seed phrase';
    case 'secure_note':
      return 'Secure note';
  }
}

function getItemDescription(item: VaultItemSummary) {
  if (item.type === 'login' && item.description === 'Login') {
    return null;
  }

  return item.description;
}

function matchesSearch(item: VaultItemSummary, searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const description = getItemDescription(item);

  const searchableText = [item.title, description, getItemTypeLabel(item)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function ItemList({
  items,
  selectedVaultList,
  selectedItemId,
  onSelectItem,
  onCreateLogin,
  onCreateTotp,
}: ItemListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(
    () => items.filter((item) => matchesSearch(item, searchQuery)),
    [items, searchQuery],
  );

  return (
    <section className="border-r p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search items."
          />
        </div>

        <CreateItemDialog
          selectedVaultList={selectedVaultList}
          onCreateLogin={onCreateLogin}
          onCreateTotp={onCreateTotp}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          {items.length === 0
            ? 'No items yet. Create your first encrypted item.'
            : 'No items match your search.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredItems.map((item) => {
            const isSelected = item.id === selectedItemId;
            const description = getItemDescription(item);

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
                      {getItemTypeLabel(item)}
                      {item.isHighSecurity ? ' · High security' : ''}
                    </p>

                    {description ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
