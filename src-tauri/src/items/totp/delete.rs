use crate::items::repository::VaultItemRepository;
use crate::items::totp::mapping::TOTP_ITEM_TYPE;

pub fn delete_totp_file_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
) -> Result<(), String> {
    repository.delete_file_item_of_type(item_id, TOTP_ITEM_TYPE)
}
