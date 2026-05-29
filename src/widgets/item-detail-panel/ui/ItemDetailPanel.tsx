import type { VaultItemDetail } from '@/entities/item';

import { useLoginItemDetail } from '../model/useLoginItemDetail';
import { EmptyItemDetail } from './EmptyItemDetail';
import { LoginItemDetail } from './LoginItemDetail';
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
  const loginItemDetail = useLoginItemDetail({
    itemId: item?.id,
    onItemDeleted,
  });

  if (!item) {
    return <EmptyItemDetail />;
  }

  if (item.type === 'login') {
    return (
      <LoginItemDetail
        item={item}
        revealedPassword={loginItemDetail.revealedPassword}
        isRevealingPassword={loginItemDetail.isRevealingPassword}
        isCopyingPassword={loginItemDetail.isCopyingPassword}
        isDeletingItem={loginItemDetail.isDeletingItem}
        revealError={loginItemDetail.revealError}
        copyMessage={loginItemDetail.copyMessage}
        deleteError={loginItemDetail.deleteError}
        onRevealPassword={loginItemDetail.handleRevealPassword}
        onHidePassword={loginItemDetail.hidePassword}
        onCopyPassword={loginItemDetail.handleCopyPassword}
        onDeleteLoginItem={loginItemDetail.handleDeleteLoginItem}
        onItemUpdated={onItemUpdated}
      />
    );
  }

  if (item.type === 'totp') {
    return <TotpItemDetail item={item} />;
  }

  if (item.type === 'seed_phrase') {
    return <SeedPhraseItemDetail item={item} />;
  }

  return <SecureNoteDetail item={item} />;
}
