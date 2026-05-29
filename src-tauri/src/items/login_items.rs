use chrono::Utc;
use uuid::Uuid;

use crate::crypto::item_payload::{ build_item_aad, encrypt_item_payload };
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{
    CreateLoginItemPayload,
    UpdateLoginItemPayload,
    VaultItemDetail,
    VaultItemType,
};
use crate::items::payloads::{ decrypt_login_payload, LoginItemEncryptedPayload };
use crate::vault::format::{ VaultFileItem, VaultItemMetadata, VAULT_VERSION };
use crate::vault::storage::{ load_vault_file, save_vault_file };

const LOGIN_ITEM_TYPE: &str = "login";
const DEFAULT_LOGIN_DESCRIPTION: &str = "Login";
const MASKED_PASSWORD: &str = "••••••••••••••••";

pub fn create_login_item(
    payload: Option<CreateLoginItemPayload>,
    vault_key: &VaultKey
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
    let item_type = LOGIN_ITEM_TYPE.to_string();
    let now = Utc::now().to_rfc3339();

    let username = normalize_optional_text(login.username);
    let website = normalize_optional_text(login.website);
    let notes = normalize_optional_text(login.notes);

    let description = website.clone().unwrap_or_else(|| DEFAULT_LOGIN_DESCRIPTION.to_string());

    let encrypted_payload_input = LoginItemEncryptedPayload {
        title: title.clone(),
        username: username.clone(),
        password: login.password,
        website,
        notes: notes.clone(),
    };

    let plaintext = serde_json
        ::to_vec(&encrypted_payload_input)
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
        password_masked: Some(MASKED_PASSWORD.to_string()),
        notes,
        is_high_security: None,
    };

    Ok((item, file_item))
}

pub fn update_login_item(
    app: &tauri::AppHandle,
    item_id: &str,
    payload: Option<UpdateLoginItemPayload>,
    vault_key: &VaultKey
) -> Result<VaultItemDetail, String> {
    let Some(login) = payload else {
        return Err("Login payload is required.".to_string());
    };

    let title = login.title.trim().to_string();

    if title.is_empty() {
        return Err("Title is required.".to_string());
    }

    let mut vault_file = load_vault_file(app)?;

    let item_index = vault_file.items
        .iter()
        .position(|item| item.id == item_id)
        .ok_or_else(|| "Item not found.".to_string())?;

    let existing_file_item = vault_file.items[item_index].clone();

    if existing_file_item.item_type != LOGIN_ITEM_TYPE {
        return Err("Unsupported item type.".to_string());
    }

    let existing_payload = decrypt_login_payload(&existing_file_item, vault_key).map_err(|_|
        "Could not update item.".to_string()
    )?;

    let username = normalize_optional_text(login.username);
    let website = normalize_optional_text(login.website);
    let notes = normalize_optional_text(login.notes);

    let password = login.password
        .filter(|value| !value.is_empty())
        .unwrap_or(existing_payload.password);

    let description = website.clone().unwrap_or_else(|| DEFAULT_LOGIN_DESCRIPTION.to_string());

    let item_type = existing_file_item.item_type.clone();
    let now = Utc::now().to_rfc3339();

    let encrypted_payload_input = LoginItemEncryptedPayload {
        title: title.clone(),
        username: username.clone(),
        password,
        website,
        notes: notes.clone(),
    };

    let plaintext = serde_json
        ::to_vec(&encrypted_payload_input)
        .map_err(|_| "Could not serialize item payload.".to_string())?;

    let aad = build_item_aad(item_id, &item_type, VAULT_VERSION);
    let encrypted_payload = encrypt_item_payload(&plaintext, vault_key, &aad)?;

    vault_file.items[item_index] = VaultFileItem {
        id: item_id.to_string(),
        item_type,
        metadata: VaultItemMetadata {
            title: title.clone(),
            tags: existing_file_item.metadata.tags,
            created_at: existing_file_item.metadata.created_at,
            updated_at: now.clone(),
        },
        encrypted_payload,
    };

    vault_file.updated_at = now;

    save_vault_file(app, &vault_file)?;

    Ok(VaultItemDetail {
        id: item_id.to_string(),
        item_type: VaultItemType::Login,
        title,
        description,
        username,
        password_masked: Some(MASKED_PASSWORD.to_string()),
        notes,
        is_high_security: None,
    })
}

pub fn persist_file_item(app: &tauri::AppHandle, file_item: VaultFileItem) -> Result<(), String> {
    let mut vault_file = load_vault_file(app)?;

    vault_file.updated_at = Utc::now().to_rfc3339();
    vault_file.items.insert(0, file_item);

    save_vault_file(app, &vault_file)
}

pub fn delete_login_file_item(app: &tauri::AppHandle, item_id: &str) -> Result<(), String> {
    let mut vault_file = load_vault_file(app)?;

    let item_index = vault_file.items
        .iter()
        .position(|item| item.id == item_id)
        .ok_or_else(|| "Item not found.".to_string())?;

    if vault_file.items[item_index].item_type != LOGIN_ITEM_TYPE {
        return Err("Unsupported item type.".to_string());
    }

    vault_file.items.remove(item_index);
    vault_file.updated_at = Utc::now().to_rfc3339();

    save_vault_file(app, &vault_file)
}

pub fn find_file_item<'a>(
    file_items: &'a [VaultFileItem],
    item_id: &str
) -> Result<&'a VaultFileItem, String> {
    file_items
        .iter()
        .find(|item| item.id == item_id)
        .ok_or_else(|| "Item not found.".to_string())
}

fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value.map(|value| value.trim().to_string()).filter(|value| !value.is_empty())
}
