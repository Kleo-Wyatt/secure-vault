use chrono::Utc;
use uuid::Uuid;

use crate::crypto::vault_key::VaultKey;
use crate::items::model::{CreateTotpItemPayload, VaultItemDetail};
use crate::items::totp::mapping::{encrypt_totp_payload, totp_detail, TOTP_ITEM_TYPE};
use crate::items::totp::normalize::normalize_totp_item;
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn create_totp_item(
    payload: Option<CreateTotpItemPayload>,
    list_id: Option<String>,
    vault_key: &VaultKey,
) -> Result<(VaultItemDetail, VaultFileItem), String> {
    let Some(totp) = payload else {
        return Err("TOTP payload is required.".to_string());
    };

    let totp = normalize_totp_item(
        totp.title,
        totp.issuer,
        totp.account,
        totp.secret,
        totp.algorithm,
        totp.digits,
        totp.period,
        totp.notes,
    )?;

    let item_id = Uuid::new_v4().to_string();
    let item_type = TOTP_ITEM_TYPE.to_string();
    let now = Utc::now().to_rfc3339();

    let encrypted_payload = encrypt_totp_payload(
        &item_id,
        &item_type,
        &totp.title,
        totp.issuer.clone(),
        totp.account.clone(),
        totp.secret,
        totp.algorithm.clone(),
        totp.digits,
        totp.period,
        totp.notes.clone(),
        vault_key,
    )?;

    let file_item = VaultFileItem {
        id: item_id.clone(),
        list_id: list_id.clone(),
        item_type,
        metadata: VaultItemMetadata {
            title: totp.title.clone(),
            tags: Vec::new(),
            created_at: now.clone(),
            updated_at: now,
        },
        encrypted_payload,
    };

    let item = totp_detail(
        item_id,
        list_id,
        totp.title,
        totp.issuer,
        totp.account,
        totp.algorithm,
        totp.digits,
        totp.period,
        totp.notes,
    );

    Ok((item, file_item))
}
