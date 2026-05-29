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
    itemTypeCounts,
    selectedItem,
    selectedItemId,
    selectedItemType,
    isLoadingItems,
    handleSelectItem,
    handleSelectItemType,
    handleCreateLogin,
    handleItemUpdated,
    handleItemDeleted,
  } = useVaultItems();

  return (
    <VaultLayout
      sidebar={
        <AppSidebar
          selectedItemType={selectedItemType}
          itemTypeCounts={itemTypeCounts}
          onSelectItemType={handleSelectItemType}
          onLock={onLock}
        />
      }
      itemList={
        <ItemList
          items={itemSummaries}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
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
