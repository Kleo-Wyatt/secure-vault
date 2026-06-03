use chrono::Utc;
use uuid::Uuid;

use crate::crypto::vault_key::VaultKey;
use crate::items::credential::mapping::{
    credential_description, credential_detail, encrypt_credential_payload,
    LEGACY_CREDENTIAL_ITEM_TYPE,
};
use crate::items::credential::normalize::{
    normalize_optional_credential_totp, normalize_optional_text, normalize_optional_website,
    normalize_required_title,
};
use crate::items::model::{CreateCredentialItemPayload, VaultItemDetail};
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn create_credential_item(
    payload: Option<CreateCredentialItemPayload>,
    list_id: Option<String>,
    vault_key: &VaultKey,
) -> Result<(VaultItemDetail, VaultFileItem), String> {
    let Some(credential) = payload else {
        return Err("Credential payload is required.".to_string());
    };

    if credential.password.is_empty() {
        return Err("Password is required.".to_string());
    }

    let item_id = Uuid::new_v4().to_string();
    let item_type = LEGACY_CREDENTIAL_ITEM_TYPE.to_string();
    let now = Utc::now().to_rfc3339();

    let title = normalize_required_title(&credential.title)?;
    let username = normalize_optional_text(credential.username);
    let website = normalize_optional_website(credential.website)?;
    let totp = normalize_optional_credential_totp(credential.totp)?;
    let notes = normalize_optional_text(credential.notes);
    let description = credential_description(&website);
    let has_totp = totp.is_some();

    let encrypted_payload = encrypt_credential_payload(
        &item_id,
        &item_type,
        &title,
        username.clone(),
        credential.password,
        website.clone(),
        totp.clone(),
        notes.clone(),
        vault_key,
    )?;

    let file_item = VaultFileItem {
        id: item_id.clone(),
        list_id: list_id.clone(),
        item_type,
        metadata: VaultItemMetadata {
            title: title.clone(),
            tags: Vec::new(),
            created_at: now.clone(),
            updated_at: now,
        },
        encrypted_payload,
    };

    let item = credential_detail(
        item_id,
        list_id,
        title,
        description,
        username,
        website,
        has_totp,
        notes,
    );

    Ok((item, file_item))
}
