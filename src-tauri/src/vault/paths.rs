use std::path::PathBuf;

pub const DEFAULT_VAULT_FILE_NAME: &str = "secure-vault.vault";

pub fn default_vault_path(app_data_dir: PathBuf) -> PathBuf {
    app_data_dir.join(DEFAULT_VAULT_FILE_NAME)
}
