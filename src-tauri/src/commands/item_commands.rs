use tauri::State;

use crate::clipboard::copy_secret_text;
use crate::commands::clipboard_timeout::schedule_clipboard_clear;
use crate::commands::item_dto::{
    CopySecretArgs, CreateItemArgs, DeleteItemArgs, RevealSecretArgs, RevealSecretResult,
    UpdateItemArgs,
};
use crate::commands::item_runtime::{
    insert_runtime_item, list_runtime_items, normalize_required_item_id, remove_runtime_item,
    replace_runtime_item, require_unlocked_vault_key, validate_password_secret_type,
};
use crate::items::login::{
    create_login_item, delete_login_file_item, read_login_password, update_login_item,
};
use crate::items::model::VaultItemDetail;
use crate::items::repository::VaultItemRepository;
use crate::items::totp::create_totp_item;
use crate::state::AppState;

#[tauri::command]
pub async fn create_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateItemArgs,
) -> Result<VaultItemDetail, String> {
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let (item, file_item) = match args.item_type.as_str() {
        "login" => create_login_item(args.login, &vault_key)?,
        "totp" => create_totp_item(args.totp, &vault_key)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

    repository.insert_file_item(file_item)?;
    insert_runtime_item(&state, item.clone())?;

    Ok(item)
}

#[tauri::command]
pub async fn update_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: UpdateItemArgs,
) -> Result<VaultItemDetail, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let item = match args.item_type.as_str() {
        "login" => update_login_item(&repository, &item_id, args.login, &vault_key)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    };

    replace_runtime_item(&state, item.clone())?;

    Ok(item)
}

#[tauri::command]
pub async fn list_items(state: State<'_, AppState>) -> Result<Vec<VaultItemDetail>, String> {
    list_runtime_items(&state)
}

#[tauri::command]
pub async fn reveal_secret(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: RevealSecretArgs,
) -> Result<RevealSecretResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    validate_password_secret_type(&args.secret_type)?;

    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let password = read_login_password(
        &repository,
        &item_id,
        &vault_key,
        "Could not reveal secret.",
    )?;

    Ok(RevealSecretResult { value: password })
}

#[tauri::command]
pub async fn copy_secret(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CopySecretArgs,
) -> Result<RevealSecretResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    validate_password_secret_type(&args.secret_type)?;

    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let password =
        read_login_password(&repository, &item_id, &vault_key, "Could not copy secret.")?;

    copy_secret_text(&password)?;
    schedule_clipboard_clear(app);

    Ok(RevealSecretResult {
        value: "Copied.".to_string(),
    })
}

#[tauri::command]
pub async fn delete_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: DeleteItemArgs,
) -> Result<(), String> {
    let item_id = normalize_required_item_id(&args.id)?;

    require_unlocked_vault_key(&state)?;

    let repository = VaultItemRepository::new(&app);

    delete_login_file_item(&repository, &item_id)?;
    remove_runtime_item(&state, &item_id)?;

    Ok(())
}
