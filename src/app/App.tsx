import { useState } from 'react';

import { UnlockPage } from '@/pages/unlock';
import { VaultPage } from '@/pages/vault';

type AppStatus = 'locked' | 'unlocked';

export function App() {
  const [status, setStatus] = useState<AppStatus>('locked');

  if (status === 'unlocked') {
    return <VaultPage onLock={() => setStatus('locked')} />;
  }

  return <UnlockPage onUnlocked={() => setStatus('unlocked')} />;
}
