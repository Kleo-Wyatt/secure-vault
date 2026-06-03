use crate::crypto::item_payload::{build_item_aad, encrypt_item_payload, EncryptedPayload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::items::payloads::{LoginItemEncryptedPayload, LoginItemTotpEncryptedPayload};
use crate::vault::format::VAULT_VERSION;

pub const LOGIN_ITEM_TYPE: &str = "login";

const DEFAULT_CREDENTIAL_DESCRIPTION: &str = "Credential";
const MASKED_PASSWORD: &str = "••••••••••••••••";

pub fn encrypt_credential_payload(
    item_id: &str,
    item_type: &str,
    title: &str,
    username: Option<String>,
    password: String,
    website: Option<String>,
    totp: Option<LoginItemTotpEncryptedPayload>,
    notes: Option<String>,
    vault_key: &VaultKey,
) -> Result<EncryptedPayload, String> {
    let payload = LoginItemEncryptedPayload {
        title: title.to_string(),
        username,
        password,
        website,
        totp,
        notes,
    };

    let plaintext = serde_json::to_vec(&payload)
        .map_err(|_| "Could not serialize item payload.".to_string())?;

    let aad = build_item_aad(item_id, item_type, VAULT_VERSION);

    encrypt_item_payload(&plaintext, vault_key, &aad)
}

pub fn credential_detail(
    id: String,
    list_id: Option<String>,
    title: String,
    description: String,
    username: Option<String>,
    website: Option<String>,
    has_totp: bool,
    notes: Option<String>,
) -> VaultItemDetail {
    VaultItemDetail {
        id,
        list_id,
        item_type: VaultItemType::Login,
        title,
        description,
        username,
        website,
        password_masked: Some(MASKED_PASSWORD.to_string()),
        issuer: None,
        account: None,
        algorithm: None,
        digits: None,
        period: None,
        code: None,
        expires_in: None,
        has_totp: Some(has_totp),
        notes,
        is_high_security: None,
    }
}

pub fn credential_detail_from_payload(
    id: String,
    list_id: Option<String>,
    payload: LoginItemEncryptedPayload,
) -> VaultItemDetail {
    let description = credential_description(&payload.website);
    let has_totp = payload.totp.is_some();

    credential_detail(
        id,
        list_id,
        payload.title,
        description,
        payload.username,
        payload.website,
        has_totp,
        payload.notes,
    )
}

pub fn credential_description(website: &Option<String>) -> String {
    website
        .clone()
        .unwrap_or_else(|| DEFAULT_CREDENTIAL_DESCRIPTION.to_string())
}
