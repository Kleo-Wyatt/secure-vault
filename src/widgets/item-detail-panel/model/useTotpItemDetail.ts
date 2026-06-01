import { useCallback, useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

import { copyTotpCode } from '@/features/copy-totp-code';
import { deleteItem } from '@/features/delete-item';
import { generateTotpCode } from '@/features/generate-totp-code';

type ClipboardClearedPayload = {
  success: boolean;
  reason: 'timeout';
};

type UseTotpItemDetailArgs = {
  itemId?: string;
  onItemDeleted?: (id: string) => void | Promise<void>;
};

export function useTotpItemDetail({
  itemId,
  onItemDeleted,
}: UseTotpItemDetailArgs) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isCopyingCode, setIsCopyingCode] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isLoadingCodeRef = useRef(false);
  const requestIdRef = useRef(0);

  const refreshCode = useCallback(async () => {
    if (!itemId || isLoadingCodeRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;
    isLoadingCodeRef.current = true;
    setIsLoadingCode(true);
    setCodeError(null);

    try {
      const result = await generateTotpCode({ id: itemId });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setCode(result.code);
      setExpiresIn(result.expiresIn);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setCode(null);
      setExpiresIn(null);
      setCodeError('Could not generate TOTP code.');
    } finally {
      if (requestId === requestIdRef.current) {
        isLoadingCodeRef.current = false;
        setIsLoadingCode(false);
      }
    }
  }, [itemId]);

  useEffect(() => {
    requestIdRef.current += 1;
    isLoadingCodeRef.current = false;
    setCode(null);
    setExpiresIn(null);
    setCodeError(null);
    setIsLoadingCode(false);
    setIsCopyingCode(false);
    setCopyMessage(null);
    setIsDeletingItem(false);
    setDeleteError(null);

    void refreshCode();
  }, [itemId, refreshCode]);

  useEffect(() => {
    if (!itemId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setExpiresIn((currentExpiresIn) => {
        if (currentExpiresIn === null) {
          return currentExpiresIn;
        }

        if (currentExpiresIn <= 1) {
          void refreshCode();

          return currentExpiresIn;
        }

        return currentExpiresIn - 1;
      });
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [itemId, refreshCode]);

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

  async function handleCopyCode() {
    if (!itemId || isCopyingCode) {
      return;
    }

    setCodeError(null);
    setCopyMessage(null);
    setDeleteError(null);
    setIsCopyingCode(true);

    try {
      await copyTotpCode({ id: itemId });

      setCopyMessage('Copied. Clipboard will be cleared after 20 seconds.');
    } catch {
      setCopyMessage(null);
      setCodeError('Could not copy TOTP code.');
    } finally {
      setIsCopyingCode(false);
    }
  }

  async function handleDeleteTotpItem(targetItemId: string) {
    if (isDeletingItem) {
      return;
    }

    setCodeError(null);
    setCopyMessage(null);
    setDeleteError(null);
    setIsDeletingItem(true);

    try {
      await deleteItem({ id: targetItemId });

      setCode(null);
      setExpiresIn(null);
      await onItemDeleted?.(targetItemId);
    } catch {
      setDeleteError('Could not delete TOTP item.');
    } finally {
      setIsDeletingItem(false);
    }
  }

  return {
    code,
    expiresIn,
    isLoadingCode,
    isCopyingCode,
    isDeletingItem,
    codeError,
    copyMessage,
    deleteError,
    refreshCode,
    handleCopyCode,
    handleDeleteTotpItem,
  };
}
