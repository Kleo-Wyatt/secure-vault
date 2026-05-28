use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::crypto::kdf::{derive_key_encryption_key, generate_kdf_salt, KdfParams};
use crate::crypto::vault_key::{decrypt_vault_key, encrypt_vault_key, generate_vault_key};
use crate::items::payloads::decrypt_file_items;
use crate::state::AppState;
use crate::vault::format::{VaultFile, VaultKdfConfig};
use crate::vault::storage::{load_vault_file, save_vault_file, vault_file_exists};

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
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateVaultArgs,
) -> Result<VaultCommandResult, String> {
    if args.master_password.len() < 12 {
        return Err("Master password is too short.".to_string());
    }

    if vault_file_exists(&app)? {
        return Err("Vault file already exists.".to_string());
    }

    let kdf_params = KdfParams::default_interactive();
    let salt = generate_kdf_salt();

    let key_encryption_key = derive_key_encryption_key(&args.master_password, &salt, &kdf_params)?;

    let vault_key = generate_vault_key();
    let encrypted_vault_key = encrypt_vault_key(&vault_key, &key_encryption_key)?;

    let now = Utc::now().to_rfc3339();
    let vault_file = VaultFile::empty(
        now,
        VaultKdfConfig::from_parts(&kdf_params, &salt),
        encrypted_vault_key,
    );

    save_vault_file(&app, &vault_file)?;

    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.unlock(vault_key);

    Ok(VaultCommandResult {
        success: true,
        message: "Vault created.".to_string(),
    })
}

#[tauri::command]
pub async fn unlock_vault(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: UnlockVaultArgs,
) -> Result<VaultCommandResult, String> {
    if args.master_password.is_empty() {
        return Err("Master password is required.".to_string());
    }

    let vault_file = load_vault_file(&app)?;

    let salt = vault_file.kdf.decode_salt()?;
    let kdf_params = vault_file.kdf.to_params();

    let key_encryption_key = derive_key_encryption_key(&args.master_password, &salt, &kdf_params)
        .map_err(|_| "Could not unlock vault.".to_string())?;

    let vault_key = decrypt_vault_key(&vault_file.encrypted_vault_key, &key_encryption_key)
        .map_err(|_| "Could not unlock vault.".to_string())?;

    let items = decrypt_file_items(&vault_file.items, &vault_key)
        .map_err(|_| "Could not unlock vault.".to_string())?;

    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.unlock(vault_key);
    vault.items = items;

    Ok(VaultCommandResult {
        success: true,
        message: "Vault unlocked.".to_string(),
    })
}

#[tauri::command]
pub async fn lock_vault(state: State<'_, AppState>) -> Result<VaultCommandResult, String> {
    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.lock();

    Ok(VaultCommandResult {
        success: true,
        message: "Vault locked.".to_string(),
    })
}
