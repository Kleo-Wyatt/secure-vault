import type { VaultItemDetail } from '@/entities/item';

import { useCredentialItemDetail } from '../model/useCredentialItemDetail';
import { CredentialItemDetail } from './CredentialItemDetail';
import { EmptyItemDetail } from './EmptyItemDetail';
import { SecureNoteDetail } from './SecureNoteDetail';
import { SeedPhraseItemDetail } from './SeedPhraseItemDetail';
import { TotpItemDetail } from './TotpItemDetail';

type ItemDetailPanelProps = {
  item?: VaultItemDetail;
  onItemDeleted?: (id: string) => void | Promise<void>;
  onItemUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function ItemDetailPanel({
  item,
  onItemDeleted,
  onItemUpdated,
}: ItemDetailPanelProps) {
  const credentialItemId = item?.type === 'login' ? item.id : undefined;

  const credentialItemDetail = useCredentialItemDetail({
    itemId: credentialItemId,
    onItemDeleted,
  });

  if (!item) {
    return <EmptyItemDetail />;
  }

  if (item.type === 'login') {
    return (
      <CredentialItemDetail
        item={item}
        revealedPassword={credentialItemDetail.revealedPassword}
        isRevealingPassword={credentialItemDetail.isRevealingPassword}
        isCopyingPassword={credentialItemDetail.isCopyingPassword}
        isDeletingItem={credentialItemDetail.isDeletingItem}
        revealError={credentialItemDetail.revealError}
        copyMessage={credentialItemDetail.copyMessage}
        deleteError={credentialItemDetail.deleteError}
        onRevealPassword={credentialItemDetail.handleRevealPassword}
        onHidePassword={credentialItemDetail.hidePassword}
        onCopyPassword={credentialItemDetail.handleCopyPassword}
        onDeleteCredentialItem={credentialItemDetail.handleDeleteCredentialItem}
        onItemUpdated={async (updatedItem) => {
          credentialItemDetail.clearTransientState();
          await onItemUpdated?.(updatedItem);
        }}
      />
    );
  }

  if (item.type === 'totp') {
    return <TotpItemDetail item={item} onItemDeleted={onItemDeleted} />;
  }

  if (item.type === 'seed_phrase') {
    return <SeedPhraseItemDetail item={item} />;
  }

  return <SecureNoteDetail item={item} />;
}
