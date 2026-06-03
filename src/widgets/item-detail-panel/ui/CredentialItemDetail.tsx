import type { VaultItemDetail } from '@/entities/item';
import { EditLoginItemDialog } from '@/features/update-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { useTotpItemDetail } from '../model/useTotpItemDetail';
import { CredentialDeleteSection } from './CredentialDeleteSection';
import { CredentialMetadataSection } from './CredentialMetadataSection';
import { CredentialPasswordSection } from './CredentialPasswordSection';
import { TotpCodeSection } from './TotpCodeSection';

type CredentialItem = Extract<VaultItemDetail, { type: 'login' }>;

type CredentialItemDetailProps = {
  item: CredentialItem;
  revealedPassword: string | null;
  isRevealingPassword: boolean;
  isCopyingPassword: boolean;
  isDeletingItem: boolean;
  revealError: string | null;
  copyMessage: string | null;
  deleteError: string | null;
  onRevealPassword: (id: string) => void;
  onHidePassword: () => void;
  onCopyPassword: (id: string) => void;
  onDeleteCredentialItem: (id: string) => void;
  onItemUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function CredentialItemDetail({
  item,
  revealedPassword,
  isRevealingPassword,
  isCopyingPassword,
  isDeletingItem,
  revealError,
  copyMessage,
  deleteError,
  onRevealPassword,
  onHidePassword,
  onCopyPassword,
  onDeleteCredentialItem,
  onItemUpdated,
}: CredentialItemDetailProps) {
  const {
    code,
    expiresIn,
    isLoadingCode,
    isCopyingCode,
    codeError,
    copyMessage: totpCopyMessage,
    refreshCode,
    handleCopyCode,
  } = useTotpItemDetail({
    itemId: item.hasTotp ? item.id : undefined,
  });

  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle>{item.title}</CardTitle>
          <EditLoginItemDialog item={item} onUpdated={onItemUpdated} />
        </CardHeader>

        <CardContent className="space-y-6">
          <CredentialMetadataSection
            username={item.username}
            website={item.website}
            notes={item.notes}
          />

          <CredentialPasswordSection
            passwordMasked={item.passwordMasked}
            revealedPassword={revealedPassword}
            isRevealingPassword={isRevealingPassword}
            isCopyingPassword={isCopyingPassword}
            revealError={revealError}
            copyMessage={copyMessage}
            onRevealPassword={() => onRevealPassword(item.id)}
            onHidePassword={onHidePassword}
            onCopyPassword={() => onCopyPassword(item.id)}
          />

          {item.hasTotp ? (
            <TotpCodeSection
              code={code}
              expiresIn={expiresIn}
              isLoadingCode={isLoadingCode}
              isCopyingCode={isCopyingCode}
              codeError={codeError}
              copyMessage={totpCopyMessage}
              onRetryCode={refreshCode}
              onCopyCode={handleCopyCode}
            />
          ) : null}

          <CredentialDeleteSection
            title={item.title}
            isDeletingItem={isDeletingItem}
            deleteError={deleteError}
            onDelete={() => onDeleteCredentialItem(item.id)}
          />
        </CardContent>
      </Card>
    </section>
  );
}
