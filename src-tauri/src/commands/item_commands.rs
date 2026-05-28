use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

use crate::items::model::{CreateLoginItemPayload, VaultItemDetail, VaultItemType};
use crate::state::AppState;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub login: Option<CreateLoginItemPayload>,
}

#[tauri::command]
pub async fn create_item(
    state: State<'_, AppState>,
    args: CreateItemArgs,
) -> Result<VaultItemDetail, String> {
    {
        let vault = state
            .vault
            .lock()
            .map_err(|_| "Could not access vault state.".to_string())?;

        vault.require_unlocked()?;
    }

    let item = match args.item_type.as_str() {
        "login" => create_login_item(args.login)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

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

fn create_login_item(payload: Option<CreateLoginItemPayload>) -> Result<VaultItemDetail, String> {
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

    // TODO: encrypt and persist item payload.
    // IMPORTANT: never log login.password.

    let description = login
        .website
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("Login")
        .to_string();

    let username = login
        .username
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let notes = login
        .notes
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    Ok(VaultItemDetail {
        id: Uuid::new_v4().to_string(),
        item_type: VaultItemType::Login,
        title,
        description,
        username,
        password_masked: Some("••••••••••••••••".to_string()),
        notes,
        is_high_security: None,
    })
}
