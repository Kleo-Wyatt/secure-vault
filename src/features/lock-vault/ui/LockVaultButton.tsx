import { useState } from 'react';
import { Lock } from 'lucide-react';

import { lockVault } from '@/features/lock-vault/api/lockVault';
import { Button } from '@/shared/ui/button';

type LockVaultButtonProps = {
  onLocked: () => void;
};

export function LockVaultButton({ onLocked }: LockVaultButtonProps) {
  const [isLocking, setIsLocking] = useState(false);

  async function handleLock() {
    if (isLocking) {
      return;
    }

    setIsLocking(true);

    try {
      await lockVault();
      onLocked();
    } catch {
      // Пока показываем нейтральное поведение:
      // если команда lock упала, всё равно блокируем UI.
      // Позже добавим error reporting без секретов.
      onLocked();
    } finally {
      setIsLocking(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleLock}
      disabled={isLocking}
    >
      <Lock className="size-4" />
      {isLocking ? 'Locking...' : 'Lock vault'}
    </Button>
  );
}
