import { useEffect, useMemo, useState } from 'react';

import {
  type VaultItemDetail,
  type VaultItemSummary,
  type VaultItemType,
} from '@/entities/item';
import type { CreateLoginItemInput } from '@/features/create-item';
import { createLoginItem } from '@/features/create-item/api/createItem';
import { listItems } from '@/features/list-items';

export type VaultItemTypeFilter = VaultItemType | 'all';

function toItemSummary(item: VaultItemDetail): VaultItemSummary {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description,
    isHighSecurity: item.isHighSecurity,
  };
}

function filterItemsByType(
  items: VaultItemDetail[],
  typeFilter: VaultItemTypeFilter,
) {
  if (typeFilter === 'all') {
    return items;
  }

  return items.filter((item) => item.type === typeFilter);
}

function getFirstItemId(items: VaultItemDetail[]) {
  return items[0]?.id ?? '';
}

function getNextSelectedItemId(
  currentItems: VaultItemDetail[],
  deletedItemId: string,
) {
  const deletedItemIndex = currentItems.findIndex(
    (item) => item.id === deletedItemId,
  );

  const remainingItems = currentItems.filter(
    (item) => item.id !== deletedItemId,
  );

  if (remainingItems.length === 0) {
    return '';
  }

  if (deletedItemIndex === -1) {
    return getFirstItemId(remainingItems);
  }

  const nextIndex = Math.min(deletedItemIndex, remainingItems.length - 1);

  return remainingItems[nextIndex]?.id ?? '';
}

export function useVaultItems() {
  const [items, setItems] = useState<VaultItemDetail[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemType, setSelectedItemType] =
    useState<VaultItemTypeFilter>('all');
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

          return getFirstItemId(loadedItems);
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

  const filteredItems = useMemo(
    () => filterItemsByType(items, selectedItemType),
    [items, selectedItemType],
  );

  const itemSummaries = useMemo(
    () => filteredItems.map(toItemSummary),
    [filteredItems],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  function handleSelectItemType(typeFilter: VaultItemTypeFilter) {
    setSelectedItemType(typeFilter);

    const nextItems = filterItemsByType(items, typeFilter);

    setSelectedItemId((currentSelectedId) => {
      if (
        currentSelectedId &&
        nextItems.some((item) => item.id === currentSelectedId)
      ) {
        return currentSelectedId;
      }

      return getFirstItemId(nextItems);
    });
  }

  async function handleCreateLogin(input: CreateLoginItemInput) {
    const newItem = await createLoginItem(input);

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemType('all');
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
    const nextVisibleItems = filterItemsByType(items, selectedItemType);
    const nextSelectedItemId = getNextSelectedItemId(
      nextVisibleItems,
      deletedItemId,
    );

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== deletedItemId),
    );
    setSelectedItemId(nextSelectedItemId);
  }

  return {
    itemSummaries,
    selectedItem,
    selectedItemId,
    selectedItemType,
    isLoadingItems,
    handleSelectItem: setSelectedItemId,
    handleSelectItemType,
    handleCreateLogin,
    handleItemUpdated,
    handleItemDeleted,
  };
}
