use serde::{ Deserialize, Serialize };
use tauri::State;

use crate::state::AppState;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateVaultArgs {
    pub master_password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnlockVaultArgs {
    pub master_password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultCommandResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub async fn create_vault(
    state: State<'_, AppState>,
    args: CreateVaultArgs
) -> Result<VaultCommandResult, String> {
    if args.master_password.len() < 12 {
        return Err("Master password is too short.".to_string());
    }

    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.is_unlocked = true;
    vault.items.clear();

    // TODO: create encrypted vault file
    // TODO: derive key with Argon2id
    // TODO: generate and encrypt vault key

    Ok(VaultCommandResult {
        success: true,
        message: "Vault created.".to_string(),
    })
}

#[tauri::command]
pub async fn unlock_vault(
    state: State<'_, AppState>,
    args: UnlockVaultArgs
) -> Result<VaultCommandResult, String> {
    if args.master_password.is_empty() {
        return Err("Master password is required.".to_string());
    }

    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.is_unlocked = true;

    // TODO: load encrypted vault file
    // TODO: derive key with Argon2id
    // TODO: decrypt vault key
    // TODO: load encrypted items into runtime state

    Ok(VaultCommandResult {
        success: true,
        message: "Vault unlocked.".to_string(),
    })
}

#[tauri::command]
pub async fn lock_vault(state: State<'_, AppState>) -> Result<VaultCommandResult, String> {
    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.is_unlocked = false;
    vault.items.clear();

    // TODO: clear decrypted vault key from memory
    // TODO: clear temporary secrets
    // TODO: clear clipboard if needed

    Ok(VaultCommandResult {
        success: true,
        message: "Vault locked.".to_string(),
    })
}
