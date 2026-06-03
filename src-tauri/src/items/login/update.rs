use chrono::Utc;

use crate::crypto::vault_key::VaultKey;
use crate::items::login::mapping::{
    encrypt_login_payload, login_description, login_detail, LOGIN_ITEM_TYPE,
};
use crate::items::login::normalize::{
    normalize_optional_text, normalize_optional_website, normalize_required_title,
};
use crate::items::model::{UpdateCredentialItemPayload, VaultItemDetail};
use crate::items::payloads::decrypt_login_payload;
use crate::items::repository::VaultItemRepository;
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn update_login_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    payload: Option<UpdateCredentialItemPayload>,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    let Some(credential) = payload else {
        return Err("Credential payload is required.".to_string());
    };

    let existing_file_item = repository.find_file_item(item_id)?;

    if existing_file_item.item_type != LOGIN_ITEM_TYPE {
        return Err("Unsupported item type.".to_string());
    }

    let existing_payload = decrypt_login_payload(&existing_file_item, vault_key)
        .map_err(|_| "Could not update item.".to_string())?;

    let title = normalize_required_title(&credential.title)?;
    let username = normalize_optional_text(credential.username);
    let website = normalize_optional_website(credential.website)?;
    let notes = normalize_optional_text(credential.notes);
    let description = login_description(&website);
    let totp = existing_payload.totp;
    let has_totp = totp.is_some();

    let password = credential
        .password
        .filter(|value| !value.is_empty())
        .unwrap_or(existing_payload.password);

    let item_type = existing_file_item.item_type;
    let now = Utc::now().to_rfc3339();

    let encrypted_payload = encrypt_login_payload(
        item_id,
        &item_type,
        &title,
        username.clone(),
        password,
        website.clone(),
        totp,
        notes.clone(),
        vault_key,
    )?;

    let file_item = VaultFileItem {
        id: item_id.to_string(),
        list_id: existing_file_item.list_id.clone(),
        item_type,
        metadata: VaultItemMetadata {
            title: title.clone(),
            tags: existing_file_item.metadata.tags,
            created_at: existing_file_item.metadata.created_at,
            updated_at: now,
        },
        encrypted_payload,
    };

    repository.replace_file_item(item_id, file_item)?;

    Ok(login_detail(
        item_id.to_string(),
        existing_file_item.list_id,
        title,
        description,
        username,
        website,
        has_totp,
        notes,
    ))
}
