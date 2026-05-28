use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

use crate::crypto::item_payload::{build_item_aad, encrypt_item_payload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{CreateLoginItemPayload, VaultItemDetail, VaultItemType};
use crate::items::payloads::{decrypt_login_payload, LoginItemEncryptedPayload};
use crate::state::AppState;
use crate::vault::format::{VaultFile, VaultFileItem, VaultItemMetadata, VAULT_VERSION};
use crate::vault::storage::{load_vault_file, save_vault_file};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub login: Option<CreateLoginItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretArgs {
    pub id: String,
    pub secret_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretResult {
    pub value: String,
}

#[tauri::command]
pub async fn create_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateItemArgs,
) -> Result<VaultItemDetail, String> {
    let vault_key = {
        let vault = state
            .vault
            .lock()
            .map_err(|_| "Could not access vault state.".to_string())?;

        *vault.require_unlocked()?
    };

    let (item, file_item) = match args.item_type.as_str() {
        "login" => create_login_item(args.login, &vault_key)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

    persist_file_item(app, file_item)?;

    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.items.insert(0, item.clone());

    Ok(item)
}

#[tauri::command]
pub async fn list_items(state: State<'_, AppState>) -> Result<Vec<VaultItemDetail>, String> {
    let vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.require_unlocked()?;

    Ok(vault.items.clone())
}

#[tauri::command]
pub async fn reveal_secret(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: RevealSecretArgs,
) -> Result<RevealSecretResult, String> {
    if args.id.trim().is_empty() {
        return Err("Item id is required.".to_string());
    }

    if args.secret_type != "password" {
        return Err("Unsupported secret type.".to_string());
    }

    let vault_key = {
        let vault = state
            .vault
            .lock()
            .map_err(|_| "Could not access vault state.".to_string())?;

        *vault.require_unlocked()?
    };

    let vault_file = load_vault_file(&app)?;

    let file_item = vault_file
        .items
        .iter()
        .find(|item| item.id == args.id)
        .ok_or_else(|| "Item not found.".to_string())?;

    let payload = decrypt_login_payload(file_item, &vault_key)
        .map_err(|_| "Could not reveal secret.".to_string())?;

    Ok(RevealSecretResult {
        value: payload.password,
    })
}

fn create_login_item(
    payload: Option<CreateLoginItemPayload>,
    vault_key: &VaultKey,
) -> Result<(VaultItemDetail, VaultFileItem), String> {
    let Some(login) = payload else {
        return Err("Login payload is required.".to_string());
    };

    let title = login.title.trim().to_string();

    if title.is_empty() {
        return Err("Title is required.".to_string());
    }

    if login.password.is_empty() {
        return Err("Password is required.".to_string());
    }

    let item_id = Uuid::new_v4().to_string();
    let item_type = "login".to_string();
    let now = Utc::now().to_rfc3339();

    let username = login
        .username
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let website = login
        .website
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let notes = login
        .notes
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let description = website.clone().unwrap_or_else(|| "Login".to_string());

    let encrypted_payload_input = LoginItemEncryptedPayload {
        title: title.clone(),
        username: username.clone(),
        password: login.password,
        website,
        notes: notes.clone(),
    };

    let plaintext = serde_json::to_vec(&encrypted_payload_input)
        .map_err(|_| "Could not serialize item payload.".to_string())?;

    let aad = build_item_aad(&item_id, &item_type, VAULT_VERSION);
    let encrypted_payload = encrypt_item_payload(&plaintext, vault_key, &aad)?;

    let file_item = VaultFileItem {
        id: item_id.clone(),
        item_type,
        metadata: VaultItemMetadata {
            title: title.clone(),
            tags: Vec::new(),
            created_at: now.clone(),
            updated_at: now,
        },
        encrypted_payload,
    };

    let item = VaultItemDetail {
        id: item_id,
        item_type: VaultItemType::Login,
        title,
        description,
        username,
        password_masked: Some("••••••••••••••••".to_string()),
        notes,
        is_high_security: None,
    };

    Ok((item, file_item))
}

fn persist_file_item(app: tauri::AppHandle, file_item: VaultFileItem) -> Result<(), String> {
    let mut vault_file = load_vault_file(&app)?;

    vault_file.updated_at = Utc::now().to_rfc3339();
    vault_file.items.insert(0, file_item);

    save_vault_file(&app, &vault_file)
}
