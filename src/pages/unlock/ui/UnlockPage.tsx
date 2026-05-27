import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import type { VaultMode } from '@/entities/vault';
import { CreateVaultForm } from '@/features/create-vault';
import { UnlockVaultForm } from '@/features/unlock-vault';

type UnlockPageProps = {
  onUnlocked: () => void;
};

export function UnlockPage({ onUnlocked }: UnlockPageProps) {
  const [mode, setMode] = useState<VaultMode>('unlock');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_480px]">
        <section className="hidden border-r bg-muted/30 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">Secure Vault</h1>
              <p className="text-sm text-muted-foreground">
                Local-first encrypted storage
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-4xl font-semibold tracking-tight">
              Passwords, 2FA secrets and seed phrases encrypted locally.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              No cloud account. No password recovery. No telemetry. Your vault
              can only be unlocked with your master password.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Security-first desktop vault
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-6">
          {mode === 'unlock' ? (
            <UnlockVaultForm
              onCreateVault={() => setMode('create')}
              onUnlocked={onUnlocked}
            />
          ) : (
            <CreateVaultForm
              onCancel={() => setMode('unlock')}
              onCreated={onUnlocked}
            />
          )}
        </section>
      </div>
    </main>
  );
}
