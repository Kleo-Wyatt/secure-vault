import { useEffect, useState } from 'react';

import { deleteItem } from '@/features/delete-item';
import { revealSecret } from '@/features/reveal-secret';

type UseSecureNoteDetailArgs = {
  itemId?: string;
  onItemDeleted?: (id: string) => void | Promise<void>;
};

export function useSecureNoteDetail({
  itemId,
  onItemDeleted,
}: UseSecureNoteDetailArgs) {
  const [revealedBody, setRevealedBody] = useState<string | null>(null);
  const [isRevealingBody, setIsRevealingBody] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setRevealedBody(null);
    setIsRevealingBody(false);
    setRevealError(null);
    setIsDeletingItem(false);
    setDeleteError(null);
  }, [itemId]);

  async function handleRevealBody(targetItemId: string) {
    if (isRevealingBody) {
      return;
    }

    setIsRevealingBody(true);
    setRevealError(null);

    try {
      const result = await revealSecret({
        id: targetItemId,
        secretType: 'secure_note_body',
      });

      setRevealedBody(result.value);
    } catch {
      setRevealedBody(null);
      setRevealError('Could not reveal secure note.');
    } finally {
      setIsRevealingBody(false);
    }
  }

  function hideBody() {
    setRevealedBody(null);
    setRevealError(null);
  }

  async function handleDeleteSecureNoteItem(targetItemId: string) {
    if (isDeletingItem) {
      return;
    }

    setIsDeletingItem(true);
    setDeleteError(null);

    try {
      await deleteItem({ id: targetItemId });
      await onItemDeleted?.(targetItemId);
    } catch {
      setDeleteError('Could not delete secure note.');
    } finally {
      setIsDeletingItem(false);
    }
  }

  return {
    revealedBody,
    isRevealingBody,
    isDeletingItem,
    revealError,
    deleteError,
    handleRevealBody,
    hideBody,
    handleDeleteSecureNoteItem,
  };
}
