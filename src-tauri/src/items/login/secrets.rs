use crate::crypto::vault_key::VaultKey;
use crate::items::login::mapping::LOGIN_ITEM_TYPE;
use crate::items::payloads::decrypt_login_payload;
use crate::items::repository::VaultItemRepository;

pub fn read_login_password(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    vault_key: &VaultKey,
    error_message: &str,
) -> Result<String, String> {
    let file_item = repository.find_file_item(item_id)?;

    let payload =
        decrypt_login_payload(&file_item, vault_key).map_err(|_| error_message.to_string())?;

    Ok(payload.password)
}

pub fn delete_login_file_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
) -> Result<(), String> {
    repository.delete_file_item_of_type(item_id, LOGIN_ITEM_TYPE)
}
