use chrono::Utc;
use uuid::Uuid;

use crate::crypto::vault_key::VaultKey;
use crate::items::login::mapping::{
    encrypt_login_payload, login_description, login_detail, LOGIN_ITEM_TYPE,
};
use crate::items::login::normalize::{normalize_optional_text, normalize_required_title};
use crate::items::model::{CreateLoginItemPayload, VaultItemDetail};
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn create_login_item(
    payload: Option<CreateLoginItemPayload>,
    vault_key: &VaultKey,
) -> Result<(VaultItemDetail, VaultFileItem), String> {
    let Some(login) = payload else {
        return Err("Login payload is required.".to_string());
    };

    let title = normalize_required_title(&login.title)?;

    if login.password.is_empty() {
        return Err("Password is required.".to_string());
    }

    let item_id = Uuid::new_v4().to_string();
    let item_type = LOGIN_ITEM_TYPE.to_string();
    let now = Utc::now().to_rfc3339();

    let username = normalize_optional_text(login.username);
    let website = normalize_optional_text(login.website);
    let notes = normalize_optional_text(login.notes);
    let description = login_description(&website);

    let encrypted_payload = encrypt_login_payload(
        &item_id,
        &item_type,
        &title,
        username.clone(),
        login.password,
        website.clone(),
        notes.clone(),
        vault_key,
    )?;

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

    let item = login_detail(item_id, title, description, username, website, notes);

    Ok((item, file_item))
}
