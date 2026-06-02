import type { VaultItemDetail } from '@/entities/item';
import { EditLoginItemDialog } from '@/features/update-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { useTotpItemDetail } from '../model/useTotpItemDetail';
import { LoginDeleteSection } from './LoginDeleteSection';
import { LoginMetadataSection } from './LoginMetadataSection';
import { LoginPasswordSection } from './LoginPasswordSection';
import { TotpCodeSection } from './TotpCodeSection';

type LoginItem = Extract<VaultItemDetail, { type: 'login' }>;

type LoginItemDetailProps = {
  item: LoginItem;
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
  onDeleteLoginItem: (id: string) => void;
  onItemUpdated?: (item: VaultItemDetail) => void | Promise<void>;
};

export function LoginItemDetail({
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
  onDeleteLoginItem,
  onItemUpdated,
}: LoginItemDetailProps) {
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
          <LoginMetadataSection
            username={item.username}
            website={item.website}
            notes={item.notes}
          />

          <LoginPasswordSection
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

          <LoginDeleteSection
            title={item.title}
            isDeletingItem={isDeletingItem}
            deleteError={deleteError}
            onDelete={() => onDeleteLoginItem(item.id)}
          />
        </CardContent>
      </Card>
    </section>
  );
}
