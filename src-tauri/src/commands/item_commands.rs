use serde::{ Deserialize, Serialize };
use std::time::Duration;
use tauri::{ Emitter, State };

use crate::clipboard::{ clear_secret_clipboard, copy_secret_text };
use crate::crypto::vault_key::VaultKey;
use crate::items::login_items::{
    create_login_item,
    delete_login_file_item,
    find_file_item,
    persist_file_item,
    update_login_item,
};
use crate::items::model::{ CreateLoginItemPayload, UpdateLoginItemPayload, VaultItemDetail };
use crate::items::payloads::decrypt_login_payload;
use crate::state::AppState;
use crate::vault::storage::load_vault_file;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub login: Option<CreateLoginItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateItemArgs {
    pub id: String,
    pub item_type: String,
    pub login: Option<UpdateLoginItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretArgs {
    pub id: String,
    pub secret_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CopySecretArgs {
    pub id: String,
    pub secret_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteItemArgs {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretResult {
    pub value: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardClearedEvent {
    pub success: bool,
    pub reason: String,
}

#[tauri::command]
pub async fn create_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateItemArgs
) -> Result<VaultItemDetail, String> {
    let vault_key = require_unlocked_vault_key(&state)?;

    let (item, file_item) = match args.item_type.as_str() {
        "login" => create_login_item(args.login, &vault_key)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

    persist_file_item(&app, file_item)?;

    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.items.insert(0, item.clone());

    Ok(item)
}

#[tauri::command]
pub async fn update_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: UpdateItemArgs
) -> Result<VaultItemDetail, String> {
    let item_id = normalize_required_item_id(&args.id)?;

    let vault_key = require_unlocked_vault_key(&state)?;

    let item = match args.item_type.as_str() {
        "login" => update_login_item(&app, &item_id, args.login, &vault_key)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    if let Some(existing_item) = vault.items.iter_mut().find(|item| item.id == item_id) {
        *existing_item = item.clone();
    } else {
        vault.items.insert(0, item.clone());
    }

    Ok(item)
}

#[tauri::command]
pub async fn list_items(state: State<'_, AppState>) -> Result<Vec<VaultItemDetail>, String> {
    let vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.require_unlocked()?;

    Ok(vault.items.clone())
}

#[tauri::command]
pub async fn reveal_secret(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: RevealSecretArgs
) -> Result<RevealSecretResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    validate_password_secret_type(&args.secret_type)?;

    let vault_key = require_unlocked_vault_key(&state)?;

    let vault_file = load_vault_file(&app)?;
    let file_item = find_file_item(&vault_file.items, &item_id)?;

    let payload = decrypt_login_payload(file_item, &vault_key).map_err(|_|
        "Could not reveal secret.".to_string()
    )?;

    Ok(RevealSecretResult {
        value: payload.password,
    })
}

#[tauri::command]
pub async fn copy_secret(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CopySecretArgs
) -> Result<RevealSecretResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    validate_password_secret_type(&args.secret_type)?;

    let vault_key = require_unlocked_vault_key(&state)?;

    let vault_file = load_vault_file(&app)?;
    let file_item = find_file_item(&vault_file.items, &item_id)?;

    let payload = decrypt_login_payload(file_item, &vault_key).map_err(|_|
        "Could not copy secret.".to_string()
    )?;

    copy_secret_text(&payload.password)?;

    let app_handle = app.clone();

    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(20));

        let success = clear_secret_clipboard().is_ok();

        let _ = app_handle.emit("clipboard-cleared", ClipboardClearedEvent {
            success,
            reason: "timeout".to_string(),
        });
    });

    Ok(RevealSecretResult {
        value: "Copied.".to_string(),
    })
}

#[tauri::command]
pub async fn delete_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: DeleteItemArgs
) -> Result<(), String> {
    let item_id = normalize_required_item_id(&args.id)?;

    require_unlocked_vault_key(&state)?;

    delete_login_file_item(&app, &item_id)?;

    let mut vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    vault.items.retain(|item| item.id != item_id);

    Ok(())
}

fn require_unlocked_vault_key(state: &State<'_, AppState>) -> Result<VaultKey, String> {
    let vault = state.vault.lock().map_err(|_| "Could not access vault state.".to_string())?;

    Ok(*vault.require_unlocked()?)
}

fn normalize_required_item_id(item_id: &str) -> Result<String, String> {
    let item_id = item_id.trim().to_string();

    if item_id.is_empty() {
        return Err("Item id is required.".to_string());
    }

    Ok(item_id)
}

fn validate_password_secret_type(secret_type: &str) -> Result<(), String> {
    if secret_type != "password" {
        return Err("Unsupported secret type.".to_string());
    }

    Ok(())
}
