use serde::{Deserialize, Serialize};

use crate::crypto::item_payload::{build_item_aad, decrypt_item_payload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::vault::format::{VaultFileItem, VAULT_VERSION};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginItemEncryptedPayload {
    pub title: String,
    pub username: Option<String>,
    pub password: String,
    pub website: Option<String>,
    pub notes: Option<String>,
}

pub fn decrypt_file_items(
    file_items: &[VaultFileItem],
    vault_key: &VaultKey,
) -> Result<Vec<VaultItemDetail>, String> {
    file_items
        .iter()
        .map(|file_item| decrypt_file_item(file_item, vault_key))
        .collect()
}

pub fn decrypt_login_payload(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<LoginItemEncryptedPayload, String> {
    if file_item.item_type != "login" {
        return Err("Unsupported item type.".to_string());
    }

    let aad = build_item_aad(&file_item.id, &file_item.item_type, VAULT_VERSION);

    let plaintext = decrypt_item_payload(&file_item.encrypted_payload, vault_key, &aad)?;

    serde_json::from_slice(&plaintext)
        .map_err(|_| "Could not parse login item payload.".to_string())
}

fn decrypt_file_item(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    match file_item.item_type.as_str() {
        "login" => decrypt_login_item(file_item, vault_key),
        _ => Err("Unsupported item type.".to_string()),
    }
}

fn decrypt_login_item(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    let payload = decrypt_login_payload(file_item, vault_key)?;

    let description = payload
        .website
        .clone()
        .unwrap_or_else(|| "Login".to_string());

    Ok(VaultItemDetail {
        id: file_item.id.clone(),
        item_type: VaultItemType::Login,
        title: payload.title,
        description,
        username: payload.username,
        password_masked: Some("••••••••••••••••".to_string()),
        notes: payload.notes,
        is_high_security: None,
    })
}
