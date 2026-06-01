import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

import { copySecret } from '@/features/copy-secret';
import { deleteItem } from '@/features/delete-item';
import { revealSecret } from '@/features/reveal-secret';

type ClipboardClearedPayload = {
  success: boolean;
  reason: 'timeout';
};

type UseLoginItemDetailArgs = {
  itemId?: string;
  onItemDeleted?: (id: string) => void | Promise<void>;
};

const REVEAL_TIMEOUT_MS = 20_000;

export function useLoginItemDetail({
  itemId,
  onItemDeleted,
}: UseLoginItemDetailArgs) {
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealingPassword, setIsRevealingPassword] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isCopyingPassword, setIsCopyingPassword] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function clearTransientState() {
    setRevealedPassword(null);
    setRevealError(null);
    setCopyMessage(null);
    setDeleteError(null);
  }

  useEffect(() => {
    setRevealedPassword(null);
    setRevealError(null);
    setIsRevealingPassword(false);
    setIsCopyingPassword(false);
    setCopyMessage(null);
    setIsDeletingItem(false);
    setDeleteError(null);
  }, [itemId]);

  useEffect(() => {
    if (!revealedPassword) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedPassword(null);
    }, REVEAL_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [revealedPassword]);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    listen<ClipboardClearedPayload>('clipboard-cleared', (event) => {
      if (event.payload.success) {
        setCopyMessage(null);
        return;
      }

      setCopyMessage(
        'Could not clear clipboard automatically. Clear it manually.',
      );
    }).then((fn) => {
      if (disposed) {
        fn();
        return;
      }

      unlisten = fn;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  async function handleRevealPassword(targetItemId: string) {
    if (isRevealingPassword) {
      return;
    }

    setRevealError(null);
    setIsRevealingPassword(true);

    try {
      const result = await revealSecret({
        id: targetItemId,
        secretType: 'password',
      });

      setRevealedPassword(result.value);
    } catch {
      setRevealedPassword(null);
      setRevealError('Could not reveal password.');
    } finally {
      setIsRevealingPassword(false);
    }
  }

  async function handleCopyPassword(targetItemId: string) {
    if (isCopyingPassword) {
      return;
    }

    setRevealError(null);
    setCopyMessage(null);
    setIsCopyingPassword(true);

    try {
      await copySecret({
        id: targetItemId,
        secretType: 'password',
      });

      setCopyMessage('Copied. Clipboard will be cleared after 20 seconds.');
    } catch {
      setCopyMessage(null);
      setRevealError('Could not copy password.');
    } finally {
      setIsCopyingPassword(false);
    }
  }

  async function handleDeleteLoginItem(targetItemId: string) {
    if (isDeletingItem) {
      return;
    }

    setRevealError(null);
    setCopyMessage(null);
    setDeleteError(null);
    setIsDeletingItem(true);

    try {
      await deleteItem({ id: targetItemId });

      setRevealedPassword(null);
      await onItemDeleted?.(targetItemId);
    } catch {
      setDeleteError('Could not delete item.');
    } finally {
      setIsDeletingItem(false);
    }
  }

  return {
    revealedPassword,
    isRevealingPassword,
    isCopyingPassword,
    isDeletingItem,
    revealError,
    copyMessage,
    deleteError,
    handleRevealPassword,
    handleCopyPassword,
    handleDeleteLoginItem,
    hidePassword: () => setRevealedPassword(null),
    clearTransientState,
  };
}
