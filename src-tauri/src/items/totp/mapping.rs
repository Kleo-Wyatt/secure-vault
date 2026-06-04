use crate::crypto::item_payload::{build_item_aad, encrypt_item_payload, EncryptedPayload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::items::payloads::TotpItemEncryptedPayload;
use crate::vault::format::VAULT_VERSION;

pub const TOTP_ITEM_TYPE: &str = "totp";

const DEFAULT_TOTP_DESCRIPTION: &str = "TOTP";

pub fn encrypt_totp_payload(
    item_id: &str,
    item_type: &str,
    title: &str,
    issuer: Option<String>,
    account: String,
    secret: String,
    algorithm: String,
    digits: u8,
    period: u32,
    notes: Option<String>,
    vault_key: &VaultKey,
) -> Result<EncryptedPayload, String> {
    let payload = TotpItemEncryptedPayload {
        title: title.to_string(),
        issuer,
        account,
        secret,
        algorithm,
        digits,
        period,
        notes,
    };

    let plaintext = serde_json::to_vec(&payload)
        .map_err(|_| "Could not serialize TOTP item payload.".to_string())?;

    let aad = build_item_aad(item_id, item_type, VAULT_VERSION);

    encrypt_item_payload(&plaintext, vault_key, &aad)
}

pub fn totp_detail(
    id: String,
    list_id: Option<String>,
    title: String,
    issuer: Option<String>,
    account: String,
    algorithm: String,
    digits: u8,
    period: u32,
    notes: Option<String>,
) -> VaultItemDetail {
    let description = totp_description(&issuer, &account);

    VaultItemDetail {
        id,
        list_id,
        item_type: VaultItemType::Totp,
        title,
        description,
        username: None,
        website: None,
        password_masked: None,
        issuer,
        account: Some(account),
        algorithm: Some(algorithm),
        digits: Some(digits),
        period: Some(period),
        code: None,
        expires_in: None,
        has_totp: None,
        notes,
        body_preview: None,
        is_high_security: None,
    }
}

pub fn totp_detail_from_payload(
    id: String,
    list_id: Option<String>,
    payload: TotpItemEncryptedPayload,
) -> VaultItemDetail {
    totp_detail(
        id,
        list_id,
        payload.title,
        payload.issuer,
        payload.account,
        payload.algorithm,
        payload.digits,
        payload.period,
        payload.notes,
    )
}

fn totp_description(issuer: &Option<String>, account: &str) -> String {
    match issuer {
        Some(issuer) => format!("{issuer} · {account}"),
        None if !account.is_empty() => account.to_string(),
        None => DEFAULT_TOTP_DESCRIPTION.to_string(),
    }
}
