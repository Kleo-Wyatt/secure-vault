use tauri::State;

use crate::crypto::vault_key::VaultKey;
use crate::items::model::VaultItemDetail;
use crate::state::AppState;

pub fn require_unlocked_vault_key(state: &State<'_, AppState>) -> Result<VaultKey, String> {
    let vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    Ok(*vault.require_unlocked()?)
}

pub fn list_runtime_items(state: &State<'_, AppState>) -> Result<Vec<VaultItemDetail>, String> {
    let vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.require_unlocked()?;

    Ok(vault.items.clone())
}

pub fn insert_runtime_item(
    state: &State<'_, AppState>,
    item: VaultItemDetail,
) -> Result<(), String> {
    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.items.insert(0, item);

    Ok(())
}

pub fn replace_runtime_item(
    state: &State<'_, AppState>,
    item: VaultItemDetail,
) -> Result<(), String> {
    let item_id = item.id.clone();

    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    if let Some(existing_item) = vault.items.iter_mut().find(|item| item.id == item_id) {
        *existing_item = item;
    } else {
        vault.items.insert(0, item);
    }

    Ok(())
}

pub fn remove_runtime_item(state: &State<'_, AppState>, item_id: &str) -> Result<(), String> {
    let mut vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.items.retain(|item| item.id != item_id);

    Ok(())
}

pub fn normalize_required_item_id(item_id: &str) -> Result<String, String> {
    let item_id = item_id.trim().to_string();

    if item_id.is_empty() {
        return Err("Item id is required.".to_string());
    }

    Ok(item_id)
}

pub fn validate_password_secret_type(secret_type: &str) -> Result<(), String> {
    if secret_type != "password" {
        return Err("Unsupported secret type.".to_string());
    }

    Ok(())
}
