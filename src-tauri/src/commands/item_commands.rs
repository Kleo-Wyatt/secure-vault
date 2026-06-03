use tauri::State;

use crate::clipboard::copy_secret_text;
use crate::commands::clipboard_timeout::schedule_clipboard_clear;
use crate::commands::item_dto::{
    CopySecretArgs, CopyTotpCodeArgs, CreateItemArgs, DeleteItemArgs, GenerateTotpCodeArgs,
    GenerateTotpCodeResult, RevealSecretArgs, RevealSecretResult, UpdateItemArgs,
};
use crate::commands::item_runtime::{
    insert_runtime_item, list_runtime_items, normalize_required_item_id, remove_runtime_item,
    replace_runtime_item, require_unlocked_vault_key, validate_password_secret_type,
};
use crate::items::credential::mapping::LEGACY_CREDENTIAL_ITEM_TYPE;
use crate::items::credential::{
    create_credential_item, delete_credential_file_item, read_credential_password,
    update_credential_item,
};
use crate::items::model::VaultItemDetail;
use crate::items::repository::VaultItemRepository;
use crate::items::secure_note::{
    create_secure_note_item, delete_secure_note_file_item, read_secure_note_body,
    SECURE_NOTE_ITEM_TYPE,
};
use crate::items::totp::{
    create_totp_item, delete_totp_file_item, generate_totp_code as generate_totp_code_from_item,
};
use crate::state::AppState;
use crate::vault::format::{VaultListKind, VaultListTemplate};
use crate::vault::storage::load_vault_file;

#[tauri::command]
pub async fn create_item(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateItemArgs,
) -> Result<VaultItemDetail, String> {
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);
    let list_id = normalize_required_list_id(args.list_id)?;

    validate_create_item_list(&app, &list_id, &args.item_type)?;

    let (item, file_item) = match args.item_type.as_str() {
        item_type if item_type == LEGACY_CREDENTIAL_ITEM_TYPE => {
            create_credential_item(args.credential, Some(list_id), &vault_key)?
        }
        "totp" => create_totp_item(args.totp, Some(list_id), &vault_key)?,
        SECURE_NOTE_ITEM_TYPE => {
            create_secure_note_item(args.secure_note, Some(list_id), &vault_key)?
        }
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
        item_type if item_type == LEGACY_CREDENTIAL_ITEM_TYPE => {
            update_credential_item(&repository, &item_id, args.credential, &vault_key)?
        }
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
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let value = match args.secret_type.as_str() {
        "password" => read_credential_password(
            &repository,
            &item_id,
            &vault_key,
            "Could not reveal secret.",
        )?,
        "secure_note_body" => read_secure_note_body(
            &repository,
            &item_id,
            &vault_key,
            "Could not reveal secure note.",
        )?,
        _ => {
            return Err("Unsupported secret type.".to_string());
        }
    };

    Ok(RevealSecretResult { value })
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
        read_credential_password(&repository, &item_id, &vault_key, "Could not copy secret.")?;

    copy_secret_text(&password)?;
    schedule_clipboard_clear(app);

    Ok(RevealSecretResult {
        value: "Copied.".to_string(),
    })
}

#[tauri::command]
pub async fn generate_totp_code(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: GenerateTotpCodeArgs,
) -> Result<GenerateTotpCodeResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let result = generate_totp_code_from_item(&repository, &item_id, &vault_key)?;

    Ok(GenerateTotpCodeResult {
        code: result.code,
        expires_in: result.expires_in,
    })
}

#[tauri::command]
pub async fn copy_totp_code(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CopyTotpCodeArgs,
) -> Result<RevealSecretResult, String> {
    let item_id = normalize_required_item_id(&args.id)?;
    let vault_key = require_unlocked_vault_key(&state)?;
    let repository = VaultItemRepository::new(&app);

    let result = generate_totp_code_from_item(&repository, &item_id, &vault_key)?;

    copy_secret_text(&result.code)?;
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
    let file_item = repository.find_file_item(&item_id)?;

    match file_item.item_type.as_str() {
        item_type if item_type == LEGACY_CREDENTIAL_ITEM_TYPE => {
            delete_credential_file_item(&repository, &item_id)?;
        }
        "totp" => delete_totp_file_item(&repository, &item_id)?,
        SECURE_NOTE_ITEM_TYPE => delete_secure_note_file_item(&repository, &item_id)?,
        _ => {
            return Err("Unsupported item type.".to_string());
        }
    }

    remove_runtime_item(&state, &item_id)?;

    Ok(())
}

fn normalize_required_list_id(list_id: Option<String>) -> Result<String, String> {
    let Some(list_id) = list_id else {
        return Err("List id is required.".to_string());
    };

    let list_id = list_id.trim().to_string();

    if list_id.is_empty() {
        return Err("List id is required.".to_string());
    }

    Ok(list_id)
}

fn validate_create_item_list(
    app: &tauri::AppHandle,
    list_id: &str,
    item_type: &str,
) -> Result<(), String> {
    let vault_file = load_vault_file(app)?;

    let Some(list) = vault_file.lists.iter().find(|list| list.id == list_id) else {
        return Err("Vault list was not found.".to_string());
    };

    validate_item_type_allowed_by_template(item_type, &list.template)
}

fn validate_item_type_allowed_by_template(
    item_type: &str,
    template: &VaultListTemplate,
) -> Result<(), String> {
    match item_type {
        item_type if item_type == LEGACY_CREDENTIAL_ITEM_TYPE && template.credentials => Ok(()),
        "totp" if template.totp => Ok(()),
        SECURE_NOTE_ITEM_TYPE if matches!(&template.kind, VaultListKind::SecureNote) => Ok(()),
        item_type
            if item_type == LEGACY_CREDENTIAL_ITEM_TYPE
                || item_type == "totp"
                || item_type == SECURE_NOTE_ITEM_TYPE =>
        {
            Err("Item type is not enabled for this list.".to_string())
        }
        _ => Err("Unsupported item type.".to_string()),
    }
}
