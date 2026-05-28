use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::{Deserialize, Serialize};

use crate::crypto::item_payload::EncryptedPayload;
use crate::crypto::kdf::{KdfParams, KDF_NAME, KDF_SALT_LEN};
use crate::crypto::vault_key::{EncryptedVaultKey, ENCRYPTION_ALGORITHM, NONCE_LEN};

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

    pub metadata: VaultItemMetadata,
    pub encrypted_payload: EncryptedPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultItemMetadata {
    pub title: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
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

impl VaultFileItem {
    pub fn validate(&self) -> Result<(), String> {
        if self.id.trim().is_empty() {
            return Err("Invalid item id.".to_string());
        }

        if self.item_type.trim().is_empty() {
            return Err("Invalid item type.".to_string());
        }

        if self.metadata.title.trim().is_empty() {
            return Err("Invalid item title.".to_string());
        }

        validate_encrypted_payload(&self.encrypted_payload)?;

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
        validate_encrypted_vault_key(&self.encrypted_vault_key)?;

        for item in &self.items {
            item.validate()?;
        }

        Ok(())
    }
}

fn validate_encrypted_vault_key(encrypted_vault_key: &EncryptedVaultKey) -> Result<(), String> {
    if encrypted_vault_key.algorithm != ENCRYPTION_ALGORITHM {
        return Err("Unsupported vault key encryption algorithm.".to_string());
    }

    validate_base64_nonce(&encrypted_vault_key.nonce, "Invalid vault key nonce.")?;

    if encrypted_vault_key.ciphertext.trim().is_empty() {
        return Err("Invalid vault key ciphertext.".to_string());
    }

    BASE64
        .decode(&encrypted_vault_key.ciphertext)
        .map_err(|_| "Invalid vault key ciphertext.".to_string())?;

    Ok(())
}

fn validate_encrypted_payload(encrypted_payload: &EncryptedPayload) -> Result<(), String> {
    if encrypted_payload.algorithm != ENCRYPTION_ALGORITHM {
        return Err("Unsupported item encryption algorithm.".to_string());
    }

    validate_base64_nonce(&encrypted_payload.nonce, "Invalid item nonce.")?;

    if encrypted_payload.ciphertext.trim().is_empty() {
        return Err("Invalid item ciphertext.".to_string());
    }

    BASE64
        .decode(&encrypted_payload.ciphertext)
        .map_err(|_| "Invalid item ciphertext.".to_string())?;

    Ok(())
}

fn validate_base64_nonce(value: &str, error_message: &str) -> Result<(), String> {
    let nonce = BASE64
        .decode(value)
        .map_err(|_| error_message.to_string())?;

    if nonce.len() != NONCE_LEN {
        return Err(error_message.to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn encrypted_vault_key() -> EncryptedVaultKey {
        EncryptedVaultKey {
            algorithm: ENCRYPTION_ALGORITHM.to_string(),
            nonce: BASE64.encode([1_u8; NONCE_LEN]),
            ciphertext: BASE64.encode([2_u8; 32]),
        }
    }

    fn encrypted_payload() -> EncryptedPayload {
        EncryptedPayload {
            algorithm: ENCRYPTION_ALGORITHM.to_string(),
            nonce: BASE64.encode([3_u8; NONCE_LEN]),
            ciphertext: BASE64.encode([4_u8; 32]),
        }
    }

    fn kdf_config() -> VaultKdfConfig {
        VaultKdfConfig {
            name: KDF_NAME.to_string(),
            salt: BASE64.encode([5_u8; KDF_SALT_LEN]),
            memory_mib: 32,
            iterations: 1,
            parallelism: 1,
        }
    }

    #[test]
    fn validates_empty_vault_file() {
        let vault_file = VaultFile::empty(
            "2026-05-28T00:00:00Z".to_string(),
            kdf_config(),
            encrypted_vault_key(),
        );

        assert!(vault_file.validate().is_ok());
    }

    #[test]
    fn validates_encrypted_item_file_format() {
        let vault_file = VaultFile {
            format: VAULT_FORMAT.to_string(),
            version: VAULT_VERSION,
            created_at: "2026-05-28T00:00:00Z".to_string(),
            updated_at: "2026-05-28T00:00:00Z".to_string(),
            kdf: kdf_config(),
            encrypted_vault_key: encrypted_vault_key(),
            items: vec![VaultFileItem {
                id: "item-1".to_string(),
                item_type: "login".to_string(),
                metadata: VaultItemMetadata {
                    title: "Binance".to_string(),
                    tags: vec!["exchange".to_string()],
                    created_at: "2026-05-28T00:00:00Z".to_string(),
                    updated_at: "2026-05-28T00:00:00Z".to_string(),
                },
                encrypted_payload: encrypted_payload(),
            }],
        };

        assert!(vault_file.validate().is_ok());
    }

    #[test]
    fn rejects_item_with_invalid_payload_algorithm() {
        let mut payload = encrypted_payload();
        payload.algorithm = "AES-GCM".to_string();

        let item = VaultFileItem {
            id: "item-1".to_string(),
            item_type: "login".to_string(),
            metadata: VaultItemMetadata {
                title: "Binance".to_string(),
                tags: Vec::new(),
                created_at: "2026-05-28T00:00:00Z".to_string(),
                updated_at: "2026-05-28T00:00:00Z".to_string(),
            },
            encrypted_payload: payload,
        };

        assert!(item.validate().is_err());
    }
}
