use chrono::Utc;
use uuid::Uuid;

use crate::crypto::vault_key::VaultKey;
use crate::items::model::{CreateSecureNoteItemPayload, VaultItemDetail};
use crate::items::secure_note::mapping::{
    encrypt_secure_note_payload, secure_note_detail, SECURE_NOTE_ITEM_TYPE,
};
use crate::items::secure_note::normalize::{normalize_required_body, normalize_required_title};
use crate::vault::format::{VaultFileItem, VaultItemMetadata};

pub fn create_secure_note_item(
    payload: Option<CreateSecureNoteItemPayload>,
    list_id: Option<String>,
    vault_key: &VaultKey,
) -> Result<(VaultItemDetail, VaultFileItem), String> {
    let Some(note) = payload else {
        return Err("Secure note payload is required.".to_string());
    };

    let item_id = Uuid::new_v4().to_string();
    let item_type = SECURE_NOTE_ITEM_TYPE.to_string();
    let now = Utc::now().to_rfc3339();

    let title = normalize_required_title(&note.title)?;
    let body = normalize_required_body(note.body)?;

    let encrypted_payload =
        encrypt_secure_note_payload(&item_id, &item_type, &title, body, vault_key)?;

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

    let item = secure_note_detail(item_id, list_id, title);

    Ok((item, file_item))
}
