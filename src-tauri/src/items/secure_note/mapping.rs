use crate::crypto::item_payload::{build_item_aad, encrypt_item_payload, EncryptedPayload};
use crate::crypto::vault_key::VaultKey;
use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::items::payloads::SecureNoteItemEncryptedPayload;
use crate::vault::format::VAULT_VERSION;

pub const SECURE_NOTE_ITEM_TYPE: &str = "secure_note";

const DEFAULT_SECURE_NOTE_DESCRIPTION: &str = "Secure note";
const HIDDEN_BODY_PREVIEW: &str = "Hidden until reveal.";

pub fn encrypt_secure_note_payload(
    item_id: &str,
    item_type: &str,
    title: &str,
    body: String,
    vault_key: &VaultKey,
) -> Result<EncryptedPayload, String> {
    let payload = SecureNoteItemEncryptedPayload {
        title: title.to_string(),
        body,
    };

    let plaintext = serde_json::to_vec(&payload)
        .map_err(|_| "Could not serialize secure note payload.".to_string())?;

    let aad = build_item_aad(item_id, item_type, VAULT_VERSION);

    encrypt_item_payload(&plaintext, vault_key, &aad)
}

pub fn secure_note_detail(id: String, list_id: Option<String>, title: String) -> VaultItemDetail {
    VaultItemDetail {
        id,
        list_id,
        item_type: VaultItemType::SecureNote,
        title,
        description: DEFAULT_SECURE_NOTE_DESCRIPTION.to_string(),
        username: None,
        website: None,
        password_masked: None,
        issuer: None,
        account: None,
        algorithm: None,
        digits: None,
        period: None,
        code: None,
        expires_in: None,
        has_totp: None,
        notes: None,
        body_preview: Some(HIDDEN_BODY_PREVIEW.to_string()),
        is_high_security: None,
    }
}

pub fn secure_note_detail_from_payload(
    id: String,
    list_id: Option<String>,
    payload: SecureNoteItemEncryptedPayload,
) -> VaultItemDetail {
    secure_note_detail(id, list_id, payload.title)
}
