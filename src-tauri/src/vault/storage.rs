use std::fs;
use std::path::PathBuf;

use tauri::Manager;

use crate::vault::format::VaultFile;
use crate::vault::paths::default_vault_path;

pub fn resolve_vault_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Could not resolve app data directory.".to_string())?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|_| "Could not create app data directory.".to_string())?;

    Ok(default_vault_path(app_data_dir))
}

pub fn vault_file_exists(app: &tauri::AppHandle) -> Result<bool, String> {
    Ok(resolve_vault_path(app)?.exists())
}

pub fn load_vault_file(app: &tauri::AppHandle) -> Result<VaultFile, String> {
    let vault_path = resolve_vault_path(app)?;

    let vault_json =
        fs::read_to_string(&vault_path).map_err(|_| "Could not read vault file.".to_string())?;

    let vault_file: VaultFile =
        serde_json::from_str(&vault_json).map_err(|_| "Could not parse vault file.".to_string())?;

    vault_file.validate()?;

    Ok(vault_file)
}

pub fn save_vault_file(app: &tauri::AppHandle, vault_file: &VaultFile) -> Result<(), String> {
    vault_file.validate()?;

    let vault_path = resolve_vault_path(app)?;
    let tmp_path = vault_path.with_extension("vault.tmp");

    let vault_json = serde_json::to_string_pretty(vault_file)
        .map_err(|_| "Could not serialize vault file.".to_string())?;

    fs::write(&tmp_path, vault_json)
        .map_err(|_| "Could not write temporary vault file.".to_string())?;

    replace_vault_file(&tmp_path, &vault_path)
}

fn replace_vault_file(tmp_path: &PathBuf, vault_path: &PathBuf) -> Result<(), String> {
    if !vault_path.exists() {
        fs::rename(tmp_path, vault_path).map_err(|_| "Could not write vault file.".to_string())?;

        return Ok(());
    }

    let backup_path = vault_path.with_extension("vault.replace");

    let _ = fs::remove_file(&backup_path);

    fs::rename(vault_path, &backup_path)
        .map_err(|_| "Could not prepare vault file replacement.".to_string())?;

    if let Err(_error) = fs::rename(tmp_path, vault_path) {
        let _ = fs::rename(&backup_path, vault_path);
        let _ = fs::remove_file(tmp_path);

        return Err("Could not replace vault file.".to_string());
    }

    let _ = fs::remove_file(&backup_path);

    Ok(())
}
