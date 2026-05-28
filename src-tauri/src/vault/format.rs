use serde::{ Deserialize, Serialize };

pub const VAULT_FORMAT: &str = "secure-vault";
pub const VAULT_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultFile {
    pub format: String,
    pub version: u32,
    pub created_at: String,
    pub updated_at: String,
    pub items: Vec<VaultFileItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultFileItem {
    pub id: String,

    #[serde(rename = "type")]
    pub item_type: String,

    pub title: String,
    pub description: String,
}

impl VaultFile {
    pub fn empty(now: String) -> Self {
        Self {
            format: VAULT_FORMAT.to_string(),
            version: VAULT_VERSION,
            created_at: now.clone(),
            updated_at: now,
            items: Vec::new(),
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.format != VAULT_FORMAT {
            return Err("Invalid vault format.".to_string());
        }

        if self.version != VAULT_VERSION {
            return Err("Unsupported vault version.".to_string());
        }

        Ok(())
    }
}
