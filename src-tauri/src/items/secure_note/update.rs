use chrono::Utc;

use crate::crypto::vault_key::VaultKey;
use crate::items::model::{UpdateSecureNoteItemPayload, VaultItemDetail};
use crate::items::repository::VaultItemRepository;
use crate::items::secure_note::mapping::{
    encrypt_secure_note_payload, secure_note_detail, SECURE_NOTE_ITEM_TYPE,
};
use crate::items::secure_note::normalize::{normalize_required_body, normalize_required_title};
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn update_secure_note_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    payload: Option<UpdateSecureNoteItemPayload>,
    vault_key: &VaultKey,
) -> Result<VaultItemDetail, String> {
    let Some(note) = payload else {
        return Err("Secure note payload is required.".to_string());
    };

    let existing_file_item = repository.find_file_item(item_id)?;

    if existing_file_item.item_type != SECURE_NOTE_ITEM_TYPE {
        return Err("Unsupported item type.".to_string());
    }

    let title = normalize_required_title(&note.title)?;
    let body = normalize_required_body(note.body)?;

    let item_type = existing_file_item.item_type.clone();
    let list_id = existing_file_item.list_id.clone();
    let now = Utc::now().to_rfc3339();

    let encrypted_payload =
        encrypt_secure_note_payload(item_id, &item_type, &title, body, vault_key)?;

    let file_item = VaultFileItem {
        id: item_id.to_string(),
        list_id: list_id.clone(),
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

    Ok(secure_note_detail(item_id.to_string(), list_id, title))
}