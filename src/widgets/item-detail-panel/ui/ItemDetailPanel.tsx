import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

import type { VaultItemDetail } from '@/entities/item';
import { revealSecret } from '@/features/reveal-secret';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { clear, writeText } from '@tauri-apps/plugin-clipboard-manager';

type ItemDetailPanelProps = {
  item?: VaultItemDetail;
};

const REVEAL_TIMEOUT_MS = 20_000;
const CLIPBOARD_TIMEOUT_MS = 20_000;

async function writeTextToClipboard(value: string) {
  await writeText(value);
}

async function clearClipboard() {
  await clear();
}

export function ItemDetailPanel({ item }: ItemDetailPanelProps) {
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealingPassword, setIsRevealingPassword] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isCopyingPassword, setIsCopyingPassword] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const copiedPasswordRef = useRef<string | null>(null);
  const clipboardTimeoutRef = useRef<number | null>(null);

  function clearClipboardTimer() {
    if (clipboardTimeoutRef.current !== null) {
      window.clearTimeout(clipboardTimeoutRef.current);
      clipboardTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    const copiedPassword = copiedPasswordRef.current;

    clearClipboardTimer();
    copiedPasswordRef.current = null;

    if (copiedPassword) {
      void clearClipboard();
    }

    setRevealedPassword(null);
    setRevealError(null);
    setIsRevealingPassword(false);
    setIsCopyingPassword(false);
    setCopyMessage(null);
  }, [item?.id]);

  useEffect(() => {
    return () => {
      const copiedPassword = copiedPasswordRef.current;

      clearClipboardTimer();
      copiedPasswordRef.current = null;

      if (copiedPassword) {
        void clearClipboard();
      }
    };
  }, []);

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

  async function handleRevealPassword(itemId: string) {
    if (isRevealingPassword) {
      return;
    }

    setRevealError(null);
    setIsRevealingPassword(true);

    try {
      const result = await revealSecret({
        id: itemId,
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

  async function handleCopyPassword(itemId: string) {
    if (isCopyingPassword) {
      return;
    }

    setRevealError(null);
    setCopyMessage(null);
    setIsCopyingPassword(true);

    try {
      const result = await revealSecret({
        id: itemId,
        secretType: 'password',
      });

      await writeTextToClipboard(result.value);

      clearClipboardTimer();
      copiedPasswordRef.current = result.value;
      setCopyMessage('Copied. Clipboard will be cleared after 20 seconds.');

      clipboardTimeoutRef.current = window.setTimeout(() => {
        const copiedPassword = copiedPasswordRef.current;

        copiedPasswordRef.current = null;
        clipboardTimeoutRef.current = null;
        setCopyMessage(null);

        if (copiedPassword) {
          void clearClipboard();
        }
      }, CLIPBOARD_TIMEOUT_MS);
    } catch {
      setCopyMessage(null);
      setRevealError('Could not copy password.');
    } finally {
      setIsCopyingPassword(false);
    }
  }

  if (!item) {
    return (
      <section className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No item selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Select an item from the list to view encrypted details.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'login') {
    return (
      <section className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm">{item.username}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Password</p>

              {revealedPassword ? (
                <input
                  className="mt-2 h-10 w-full rounded-lg border bg-muted/40 px-3 font-mono text-sm outline-none selection:bg-primary selection:text-primary-foreground"
                  value={revealedPassword}
                  spellCheck={false}
                  readOnly
                  aria-label="Revealed password"
                  onFocus={(event) => event.currentTarget.select()}
                />
              ) : (
                <code className="mt-2 block rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm">
                  {item.passwordMasked}
                </code>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {revealedPassword ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevealedPassword(null)}
                  >
                    Hide
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevealPassword(item.id)}
                    disabled={isRevealingPassword}
                  >
                    {isRevealingPassword ? 'Revealing...' : 'Reveal'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPassword(item.id)}
                  disabled={isCopyingPassword}
                >
                  {isCopyingPassword ? 'Copying...' : 'Copy'}
                </Button>
              </div>

              {revealedPassword ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Password will be hidden automatically after 20 seconds. Focus
                  the field to select and copy the full value.
                </p>
              ) : null}

              {revealError ? (
                <p className="mt-2 text-xs text-destructive">{revealError}</p>
              ) : null}
            </div>

            {copyMessage ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {copyMessage}
              </p>
            ) : null}

            {item.totpCode ? (
              <div>
                <p className="text-xs text-muted-foreground">TOTP</p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="text-2xl font-semibold tracking-widest">
                    {item.totpCode}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {item.totpExpiresIn}s left
                  </span>
                </div>
              </div>
            ) : null}

            {item.notes ? (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'totp') {
    return (
      <section className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground">Issuer</p>
              <p className="text-sm">{item.issuer}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Account</p>
              <p className="text-sm">{item.account}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Code</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="text-3xl font-semibold tracking-widest">
                  {item.code}
                </code>
                <span className="text-xs text-muted-foreground">
                  {item.expiresIn}s left
                </span>
              </div>
            </div>

            <Button variant="outline">Copy code</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (item.type === 'seed_phrase') {
    return (
      <section className="p-6">
        <Card className="max-w-2xl border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              {item.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium">High security item</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This seed phrase can move all funds in the wallet. It is hidden
                by default and should only be revealed when absolutely needed.
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Wallet</p>
              <p className="text-sm">{item.walletName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="text-sm">{item.wordCount}</p>
            </div>

            {item.derivationPath ? (
              <div>
                <p className="text-xs text-muted-foreground">Derivation path</p>
                <code className="text-sm">{item.derivationPath}</code>
              </div>
            ) : null}

            <div>
              <p className="text-xs text-muted-foreground">Passphrase</p>
              <p className="text-sm">
                {item.passphraseStored ? 'Stored' : 'Not stored'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="destructive">Reveal word by word</Button>
              <Button variant="outline">Verify backup</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            {item.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Secure note</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.bodyPreview}
            </p>
          </div>

          <Button variant="outline">Reveal note</Button>
        </CardContent>
      </Card>
    </section>
  );
}
