import { useEffect, useMemo, useState } from 'react';

import { type VaultItemDetail, type VaultItemSummary } from '@/entities/item';
import type { CreateLoginItemInput } from '@/features/create-item';
import { createLoginItem } from '@/features/create-item/api/createItem';
import { listItems } from '@/features/list-items';
import { AppSidebar } from '@/widgets/app-sidebar';
import { ItemDetailPanel } from '@/widgets/item-detail-panel';
import { ItemList } from '@/widgets/item-list';
import { VaultLayout } from '@/widgets/vault-layout';

type VaultPageProps = {
  onLock: () => void;
};

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
  const [items, setItems] = useState<VaultItemDetail[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      setIsLoadingItems(true);

      try {
        const loadedItems = await listItems();

        if (!isMounted) {
          return;
        }

        setItems(loadedItems);
        setSelectedItemId((currentSelectedId) => {
          if (
            currentSelectedId &&
            loadedItems.some((item) => item.id === currentSelectedId)
          ) {
            return currentSelectedId;
          }

          return loadedItems[0]?.id ?? '';
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setSelectedItemId('');
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    }

    void loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const itemSummaries = useMemo(() => items.map(toItemSummary), [items]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  async function handleCreateLogin(input: CreateLoginItemInput) {
    const newItem = await createLoginItem(input);

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemId(newItem.id);
  }

  function handleItemUpdated(updatedItem: VaultItemDetail) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );
    setSelectedItemId(updatedItem.id);
  }

  function handleItemDeleted(deletedItemId: string) {
    setSelectedItemId('');
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== deletedItemId),
    );
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
      detailPanel={
        isLoadingItems ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Loading vault items...
          </div>
        ) : (
          <ItemDetailPanel
            item={selectedItem}
            onItemDeleted={handleItemDeleted}
            onItemUpdated={handleItemUpdated}
          />
        )
      }
    />
  );
}
