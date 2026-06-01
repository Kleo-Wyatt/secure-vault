import { useCallback, useEffect, useRef, useState } from 'react';

import { generateTotpCode } from '@/features/generate-totp-code';

type UseTotpItemDetailArgs = {
  itemId?: string;
};

export function useTotpItemDetail({ itemId }: UseTotpItemDetailArgs) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

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

  return {
    code,
    expiresIn,
    isLoadingCode,
    codeError,
    refreshCode,
  };
}
