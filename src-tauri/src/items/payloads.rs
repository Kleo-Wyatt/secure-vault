use serde::{Deserialize, Serialize};

use crate::crypto::item_payload::{build_item_aad, decrypt_item_payload};
use crate::crypto::vault_key::VaultKey;
use crate::items::credential::mapping::credential_detail_from_payload;
use crate::items::model::VaultItemDetail;
use crate::items::totp::mapping::totp_detail_from_payload;
use crate::vault::format::{VaultFileItem, VAULT_VERSION};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialItemEncryptedPayload {
    pub title: String,
    pub username: Option<String>,
    pub password: String,
    pub website: Option<String>,

    #[serde(default)]
    pub totp: Option<CredentialItemTotpEncryptedPayload>,

    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialItemTotpEncryptedPayload {
    pub issuer: Option<String>,
    pub account: Option<String>,
    pub secret: String,
    pub algorithm: String,
    pub digits: u8,
    pub period: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TotpItemEncryptedPayload {
    pub title: String,
    pub issuer: Option<String>,
    pub account: String,
    pub secret: String,
    pub algorithm: String,
    pub digits: u8,
    pub period: u32,
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

pub fn decrypt_credential_payload(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<CredentialItemEncryptedPayload, String> {
    if file_item.item_type != "login" {
        return Err("Unsupported item type.".to_string());
    }

    let aad = build_item_aad(&file_item.id, &file_item.item_type, VAULT_VERSION);

    let plaintext = decrypt_item_payload(&file_item.encrypted_payload, vault_key, &aad)?;

    serde_json::from_slice(&plaintext)
        .map_err(|_| "Could not parse credential item payload.".to_string())
}

pub fn decrypt_totp_payload(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<TotpItemEncryptedPayload, String> {
    if file_item.item_type != "totp" {
        return Err("Unsupported item type.".to_string());
    }

    let aad = build_item_aad(&file_item.id, &file_item.item_type, VAULT_VERSION);

    let plaintext = decrypt_item_payload(&file_item.encrypted_payload, vault_key, &aad)?;

    serde_json::from_slice(&plaintext).map_err(|_| "Could not parse TOTP item payload.".to_string())
}

fn decrypt_file_item(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    match file_item.item_type.as_str() {
        "login" => decrypt_credential_item(file_item, vault_key),
        "totp" => decrypt_totp_item(file_item, vault_key),
        _ => Err("Unsupported item type.".to_string()),
    }
}

fn decrypt_credential_item(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    let payload = decrypt_credential_payload(file_item, vault_key)?;

    Ok(credential_detail_from_payload(
        file_item.id.clone(),
        file_item.list_id.clone(),
        payload,
    ))
}

fn decrypt_totp_item(
    file_item: &VaultFileItem,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    let payload = decrypt_totp_payload(file_item, vault_key)?;

    Ok(totp_detail_from_payload(
        file_item.id.clone(),
        file_item.list_id.clone(),
        payload,
    ))
}
