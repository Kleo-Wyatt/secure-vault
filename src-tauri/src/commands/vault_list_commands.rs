use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

use crate::state::AppState;
use crate::vault::format::{VaultFileList, VaultListKind, VaultListTemplate};
use crate::vault::storage::{load_vault_file, save_vault_file};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateVaultListArgs {
    pub name: String,
    pub template: VaultListTemplateArgs,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultListTemplateArgs {
    pub kind: VaultListKind,

    #[serde(default, alias = "login")]
    pub credentials: bool,

    pub totp: bool,
    pub notes: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultListResult {
    pub id: String,
    pub name: String,
    pub template: VaultListTemplateResult,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultListTemplateResult {
    pub kind: VaultListKind,
    pub credentials: bool,
    pub totp: bool,
    pub notes: bool,
}

#[tauri::command]
pub async fn list_vault_lists(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<Vec<VaultListResult>, String> {
    require_unlocked_vault(&state)?;

    let vault_file = load_vault_file(&app)?;

    Ok(vault_file
        .lists
        .into_iter()
        .map(vault_list_result)
        .collect())
}

#[tauri::command]
pub async fn create_vault_list(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    args: CreateVaultListArgs,
) -> Result<VaultListResult, String> {
    require_unlocked_vault(&state)?;

    let name = normalize_required_list_name(&args.name)?;
    let template = vault_list_template(args.template)?;

    let mut vault_file = load_vault_file(&app)?;

    if vault_file
        .lists
        .iter()
        .any(|list| list.name.eq_ignore_ascii_case(&name))
    {
        return Err("List with this name already exists.".to_string());
    }

    let now = Utc::now().to_rfc3339();

    let list = VaultFileList {
        id: Uuid::new_v4().to_string(),
        name,
        template,
        created_at: now.clone(),
        updated_at: now.clone(),
    };

    vault_file.lists.insert(0, list.clone());
    vault_file.updated_at = now;

    save_vault_file(&app, &vault_file)?;

    Ok(vault_list_result(list))
}

fn require_unlocked_vault(state: &State<'_, AppState>) -> Result<(), String> {
    let vault = state
        .vault
        .lock()
        .map_err(|_| "Could not access vault state.".to_string())?;

    vault.require_unlocked()?;

    Ok(())
}

fn normalize_required_list_name(name: &str) -> Result<String, String> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err("List name is required.".to_string());
    }

    Ok(name)
}

fn vault_list_template(args: VaultListTemplateArgs) -> Result<VaultListTemplate, String> {
    let template = VaultListTemplate {
        kind: args.kind,
        credentials: args.credentials,
        totp: args.totp,
        notes: args.notes,
    };

    template.validate()?;

    Ok(template)
}

fn vault_list_result(list: VaultFileList) -> VaultListResult {
    VaultListResult {
        id: list.id,
        name: list.name,
        template: VaultListTemplateResult {
            kind: list.template.kind,
            credentials: list.template.credentials,
            totp: list.template.totp,
            notes: list.template.notes,
        },
        created_at: list.created_at,
        updated_at: list.updated_at,
    }
}
