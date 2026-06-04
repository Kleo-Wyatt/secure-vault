import { callTauriCommand } from '@/shared/api/tauri';

type RevealSecretArgs = {
  id: string;
  secretType: 'password' | 'secure_note_body';
};

type RevealSecretResult = {
  value: string;
};

export function revealSecret(args: RevealSecretArgs) {
  return callTauriCommand<RevealSecretResult, { args: RevealSecretArgs }>(
    'reveal_secret',
    { args },
  );
}
