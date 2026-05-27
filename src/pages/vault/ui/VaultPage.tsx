import { useMemo, useState } from 'react';

import {
  mockVaultItemDetails,
  type VaultItemDetail,
  type VaultItemSummary,
} from '@/entities/item';
import type { CreateLoginItemInput } from '@/features/create-item';
import { AppSidebar } from '@/widgets/app-sidebar';
import { ItemDetailPanel } from '@/widgets/item-detail-panel';
import { ItemList } from '@/widgets/item-list';
import { VaultLayout } from '@/widgets/vault-layout';

type VaultPageProps = {
  onLock: () => void;
};

function createClientId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}`;
}

function createLoginItemDetail(input: CreateLoginItemInput): VaultItemDetail {
  const id = createClientId();

  return {
    id,
    type: 'login',
    title: input.title,
    description: input.website ?? 'Login',
    username: input.username ?? '',
    passwordMasked: '••••••••••••••••',
    notes: input.notes,
  };
}

function toItemSummary(item: VaultItemDetail): VaultItemSummary {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description,
    isHighSecurity: item.isHighSecurity,
  };
}

export function VaultPage({ onLock }: VaultPageProps) {
  const [items, setItems] = useState<VaultItemDetail[]>(mockVaultItemDetails);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id ?? '');

  const itemSummaries = useMemo(() => items.map(toItemSummary), [items]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  function handleCreateLogin(input: CreateLoginItemInput) {
    const newItem = createLoginItemDetail(input);

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemId(newItem.id);
  }

  return (
    <VaultLayout
      sidebar={<AppSidebar onLock={onLock} />}
      itemList={
        <ItemList
          items={itemSummaries}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          onCreateLogin={handleCreateLogin}
        />
      }
      detailPanel={<ItemDetailPanel item={selectedItem} />}
    />
  );
}
