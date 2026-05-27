use serde::{ Deserialize, Serialize };

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
pub async fn create_vault(args: CreateVaultArgs) -> Result<VaultCommandResult, String> {
    if args.master_password.len() < 12 {
        return Err("Master password is too short.".to_string());
    }

    // TODO: create encrypted vault file
    // TODO: derive key with Argon2id
    // TODO: generate and encrypt vault key

    Ok(VaultCommandResult {
        success: true,
        message: "Vault created.".to_string(),
    })
}

#[tauri::command]
pub async fn unlock_vault(args: UnlockVaultArgs) -> Result<VaultCommandResult, String> {
    if args.master_password.is_empty() {
        return Err("Master password is required.".to_string());
    }

    // TODO: load vault file
    // TODO: derive key with Argon2id
    // TODO: decrypt vault key

    Ok(VaultCommandResult {
        success: true,
        message: "Vault unlocked.".to_string(),
    })
}

#[tauri::command]
pub async fn lock_vault() -> Result<VaultCommandResult, String> {
    // TODO: clear decrypted vault key from memory
    // TODO: clear temporary secrets
    // TODO: clear clipboard if needed

    Ok(VaultCommandResult {
        success: true,
        message: "Vault locked.".to_string(),
    })
}
