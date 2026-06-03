import { AppSidebar } from '@/widgets/app-sidebar';
import { ItemDetailPanel } from '@/widgets/item-detail-panel';
import { ItemList } from '@/widgets/item-list';
import { VaultLayout } from '@/widgets/vault-layout';

import { useVaultItems } from '../model/useVaultItems';

type VaultPageProps = {
  onLock: () => void;
};

export function VaultPage({ onLock }: VaultPageProps) {
  const {
    itemSummaries,
    vaultLists,
    selectedVaultList,
    selectedItem,
    selectedItemId,
    selectedListId,
    isLoadingItems,
    handleSelectItem,
    handleSelectList,
    handleCreateVaultList,
   handleCreateCredential,
    handleCreateTotp,
    handleItemUpdated,
    handleItemDeleted,
  } = useVaultItems();

  return (
    <VaultLayout
      sidebar={
        <AppSidebar
          vaultLists={vaultLists}
          selectedListId={selectedListId}
          onSelectList={handleSelectList}
          onCreateList={handleCreateVaultList}
          onLock={onLock}
        />
      }
      itemList={
        <ItemList
          items={itemSummaries}
          selectedVaultList={selectedVaultList}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
          onCreateCredential={handleCreateCredential}
          onCreateTotp={handleCreateTotp}
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
