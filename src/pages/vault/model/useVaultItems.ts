import { useEffect, useMemo, useState } from 'react';

import {
  isCredentialItem,
  type VaultItemDetail,
  type VaultItemSummary,
} from '@/entities/item';
import {
  createCredentialItem,
  createSecureNoteItem,
  createTotpItem,
  type CreateCredentialItemInput,
  type CreateSecureNoteItemInput,
  type CreateTotpItemInput,
} from '@/features/create-item';
import { listItems } from '@/features/list-items';
import {
  createVaultList,
  listVaultLists,
  type CreateVaultListInput,
  type VaultList,
} from '@/features/vault-lists';

const ALL_ITEMS_LIST_ID = 'all';

function toItemSummary(item: VaultItemDetail): VaultItemSummary {
  return {
    id: item.id,
    listId: item.listId,
    title: item.title,
    type: item.type,
    description: item.description,
    hasTotp: isCredentialItem(item) ? item.hasTotp : undefined,
    isHighSecurity: item.isHighSecurity,
  };
}

function filterItemsByList(items: VaultItemDetail[], selectedListId: string) {
  if (selectedListId === ALL_ITEMS_LIST_ID) {
    return items;
  }

  return items.filter((item) => item.listId === selectedListId);
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

function getRequiredCreateListId(selectedListId: string) {
  if (selectedListId === ALL_ITEMS_LIST_ID) {
    throw new Error('Select a list before creating an item.');
  }

  return selectedListId;
}

export function useVaultItems() {
  const [items, setItems] = useState<VaultItemDetail[]>([]);
  const [vaultLists, setVaultLists] = useState<VaultList[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedListId, setSelectedListId] = useState(ALL_ITEMS_LIST_ID);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadVaultData() {
      setIsLoadingItems(true);

      try {
        const [loadedItems, loadedLists] = await Promise.all([
          listItems(),
          listVaultLists(),
        ]);

        if (!isMounted) {
          return;
        }

        setItems(loadedItems);
        setVaultLists(loadedLists);
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
        setVaultLists([]);
        setSelectedItemId('');
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    }

    void loadVaultData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(
    () => filterItemsByList(items, selectedListId),
    [items, selectedListId],
  );

  const itemSummaries = useMemo(
    () => filteredItems.map(toItemSummary),
    [filteredItems],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  const selectedVaultList = useMemo(
    () => vaultLists.find((list) => list.id === selectedListId),
    [vaultLists, selectedListId],
  );

  function handleSelectList(nextSelectedListId: string) {
    setSelectedListId(nextSelectedListId);

    const nextItems = filterItemsByList(items, nextSelectedListId);

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

  async function handleCreateCredential(input: CreateCredentialItemInput) {
    const newItem = await createCredentialItem({
      ...input,
      listId: getRequiredCreateListId(selectedListId),
    });

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemId(newItem.id);
  }

  async function handleCreateTotp(input: CreateTotpItemInput) {
    const newItem = await createTotpItem({
      ...input,
      listId: getRequiredCreateListId(selectedListId),
    });

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemId(newItem.id);
  }

  async function handleCreateSecureNote(input: CreateSecureNoteItemInput) {
    const newItem = await createSecureNoteItem({
      ...input,
      listId: getRequiredCreateListId(selectedListId),
    });

    setItems((currentItems) => [newItem, ...currentItems]);
    setSelectedItemId(newItem.id);
  }

  async function handleCreateVaultList(input: CreateVaultListInput) {
    const newList = await createVaultList(input);

    setVaultLists((currentLists) => [newList, ...currentLists]);
    setSelectedListId(newList.id);
    setSelectedItemId('');
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
    const nextVisibleItems = filterItemsByList(items, selectedListId);
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
    vaultLists,
    selectedVaultList,
    selectedItem,
    selectedItemId,
    selectedListId,
    isLoadingItems,
    handleSelectItem: setSelectedItemId,
    handleSelectList,
    handleCreateVaultList,
    handleCreateCredential,
    handleCreateTotp,
    handleCreateSecureNote,
    handleItemUpdated,
    handleItemDeleted,
  };
}
