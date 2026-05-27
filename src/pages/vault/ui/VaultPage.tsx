import { useMemo, useState } from 'react';

import { mockVaultItemDetails, mockVaultItems } from '@/entities/item';
import { AppSidebar } from '@/widgets/app-sidebar';
import { ItemDetailPanel } from '@/widgets/item-detail-panel';
import { ItemList } from '@/widgets/item-list';
import { VaultLayout } from '@/widgets/vault-layout';

type VaultPageProps = {
  onLock: () => void;
};

export function VaultPage({ onLock }: VaultPageProps) {
  const [selectedItemId, setSelectedItemId] = useState(
    mockVaultItems[0]?.id ?? '',
  );

  const selectedItem = useMemo(
    () => mockVaultItemDetails.find((item) => item.id === selectedItemId),
    [selectedItemId],
  );

  return (
    <VaultLayout
      sidebar={<AppSidebar onLock={onLock} />}
      itemList={
        <ItemList
          items={mockVaultItems}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
        />
      }
      detailPanel={<ItemDetailPanel item={selectedItem} />}
    />
  );
}
