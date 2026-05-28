use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::{Deserialize, Serialize};

use crate::crypto::kdf::{KdfParams, KDF_NAME, KDF_SALT_LEN};
use crate::crypto::vault_key::{EncryptedVaultKey, ENCRYPTION_ALGORITHM};

pub const VAULT_FORMAT: &str = "secure-vault";
pub const VAULT_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultFile {
    pub format: String,
    pub version: u32,
    pub created_at: String,
    pub updated_at: String,
    pub kdf: VaultKdfConfig,
    pub encrypted_vault_key: EncryptedVaultKey,
    pub items: Vec<VaultFileItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultKdfConfig {
    pub name: String,
    pub salt: String,

    #[serde(rename = "memoryMiB")]
    pub memory_mib: u32,

    pub iterations: u32,
    pub parallelism: u32,
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

impl VaultKdfConfig {
    pub fn from_parts(params: &KdfParams, salt: &[u8]) -> Self {
        Self {
            name: params.name.clone(),
            salt: BASE64.encode(salt),
            memory_mib: params.memory_mib,
            iterations: params.iterations,
            parallelism: params.parallelism,
        }
    }

    pub fn to_params(&self) -> KdfParams {
        KdfParams {
            name: self.name.clone(),
            memory_mib: self.memory_mib,
            iterations: self.iterations,
            parallelism: self.parallelism,
        }
    }

    pub fn decode_salt(&self) -> Result<Vec<u8>, String> {
        let salt = BASE64
            .decode(&self.salt)
            .map_err(|_| "Invalid KDF salt.".to_string())?;

        if salt.len() != KDF_SALT_LEN {
            return Err("Invalid KDF salt length.".to_string());
        }

        Ok(salt)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.name != KDF_NAME {
            return Err("Unsupported KDF.".to_string());
        }

        self.decode_salt()?;

        if self.memory_mib == 0 {
            return Err("Invalid KDF memory cost.".to_string());
        }

        if self.iterations == 0 {
            return Err("Invalid KDF iterations.".to_string());
        }

        if self.parallelism == 0 {
            return Err("Invalid KDF parallelism.".to_string());
        }

        Ok(())
    }
}

impl VaultFile {
    pub fn empty(now: String, kdf: VaultKdfConfig, encrypted_vault_key: EncryptedVaultKey) -> Self {
        Self {
            format: VAULT_FORMAT.to_string(),
            version: VAULT_VERSION,
            created_at: now.clone(),
            updated_at: now,
            kdf,
            encrypted_vault_key,
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

        self.kdf.validate()?;

        if self.encrypted_vault_key.algorithm != ENCRYPTION_ALGORITHM {
            return Err("Unsupported vault key encryption algorithm.".to_string());
        }

        Ok(())
    }
}
