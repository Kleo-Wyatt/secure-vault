import { callTauriCommand } from "@/shared/api/tauri";

type UnlockVaultArgs = {
  masterPassword: string;
};

type UnlockVaultResult = {
  success: boolean;
  message: string;
};

export function unlockVault(args: UnlockVaultArgs) {
  return callTauriCommand<UnlockVaultResult, { args: UnlockVaultArgs }>(
    "unlock_vault",
    { args },
  );
}