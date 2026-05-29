use crate::crypto::item_payload::{build_item_aad, encrypt_item_payload, EncryptedPayload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::items::payloads::LoginItemEncryptedPayload;
use crate::vault::format::VAULT_VERSION;

pub const LOGIN_ITEM_TYPE: &str = "login";

const DEFAULT_LOGIN_DESCRIPTION: &str = "Login";
const MASKED_PASSWORD: &str = "••••••••••••••••";

pub fn encrypt_login_payload(
    item_id: &str,
    item_type: &str,
    title: &str,
    username: Option<String>,
    password: String,
    website: Option<String>,
    notes: Option<String>,
    vault_key: &VaultKey,
) -> Result<EncryptedPayload, String> {
    let payload = LoginItemEncryptedPayload {
        title: title.to_string(),
        username,
        password,
        website,
        notes,
    };

    let plaintext = serde_json::to_vec(&payload)
        .map_err(|_| "Could not serialize item payload.".to_string())?;

    let aad = build_item_aad(item_id, item_type, VAULT_VERSION);

    encrypt_item_payload(&plaintext, vault_key, &aad)
}

pub fn login_detail(
    id: String,
    title: String,
    description: String,
    username: Option<String>,
    notes: Option<String>,
) -> VaultItemDetail {
    VaultItemDetail {
        id,
        item_type: VaultItemType::Login,
        title,
        description,
        username,
        password_masked: Some(MASKED_PASSWORD.to_string()),
        notes,
        is_high_security: None,
    }
}

pub fn login_detail_from_payload(
    id: String,
    payload: LoginItemEncryptedPayload,
) -> VaultItemDetail {
    let description = login_description(&payload.website);

    login_detail(
        id,
        payload.title,
        description,
        payload.username,
        payload.notes,
    )
}

pub fn login_description(website: &Option<String>) -> String {
    website
        .clone()
        .unwrap_or_else(|| DEFAULT_LOGIN_DESCRIPTION.to_string())
}
