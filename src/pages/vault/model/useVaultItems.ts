import { useEffect, useMemo, useState } from 'react';

import {
  type VaultItemDetail,
  type VaultItemSummary,
  type VaultItemType,
} from '@/entities/item';
import {
  createLoginItem,
  createTotpItem,
  type CreateLoginItemInput,
  type CreateTotpItemInput,
} from '@/features/create-item';
import { listItems } from '@/features/list-items';

export type VaultItemTypeFilter = VaultItemType | 'all';

export type VaultItemTypeCounts = Record<VaultItemTypeFilter, number>;

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

function getItemTypeCounts(items: VaultItemDetail[]): VaultItemTypeCounts {
  return items.reduce<VaultItemTypeCounts>(
    (counts, item) => ({
      ...counts,
      all: counts.all + 1,
      [item.type]: counts[item.type] + 1,
    }),
    {
      all: 0,
      login: 0,
      totp: 0,
      seed_phrase: 0,
      secure_note: 0,
    },
  );
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

function getTypeFilterForCreatedItem(
  currentFilter: VaultItemTypeFilter,
  createdItemType: VaultItemType,
): VaultItemTypeFilter {
  if (currentFilter === 'all' || currentFilter === createdItemType) {
    return currentFilter;
  }

  return createdItemType;
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

  const itemTypeCounts = useMemo(() => getItemTypeCounts(items), [items]);

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
    setSelectedItemType((currentFilter) =>
      getTypeFilterForCreatedItem(currentFilter, newItem.type),
    );
    setSelectedItemId(newItem.id);
  }

  async function handleCreateTotp(input: CreateTotpItemInput) {
    const newItem = await createTotpItem(input);

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemType((currentFilter) =>
      getTypeFilterForCreatedItem(currentFilter, newItem.type),
    );
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
    itemTypeCounts,
    selectedItem,
    selectedItemId,
    selectedItemType,
    isLoadingItems,
    handleSelectItem: setSelectedItemId,
    handleSelectItemType,
    handleCreateLogin,
    handleCreateTotp,
    handleItemUpdated,
    handleItemDeleted,
  };
}
