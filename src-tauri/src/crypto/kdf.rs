use argon2::{Algorithm, Argon2, Params, Version};
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};

pub const KDF_NAME: &str = "argon2id";
pub const KDF_SALT_LEN: usize = 32;
pub const KEY_LEN: usize = 32;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct KdfParams {
    pub name: String,
    pub memory_mib: u32,
    pub iterations: u32,
    pub parallelism: u32,
}

impl KdfParams {
    pub fn default_interactive() -> Self {
        Self {
            name: KDF_NAME.to_string(),
            memory_mib: 256,
            iterations: 3,
            parallelism: 1,
        }
    }

    #[cfg(test)]
    fn test_fast() -> Self {
        Self {
            name: KDF_NAME.to_string(),
            memory_mib: 1,
            iterations: 1,
            parallelism: 1,
        }
    }
}

pub fn generate_kdf_salt() -> [u8; KDF_SALT_LEN] {
    let mut salt = [0_u8; KDF_SALT_LEN];
    OsRng.fill_bytes(&mut salt);
    salt
}

pub fn derive_key_encryption_key(
    master_password: &str,
    salt: &[u8],
    params: &KdfParams,
) -> Result<[u8; KEY_LEN], String> {
    if master_password.is_empty() {
        return Err("Master password is required.".to_string());
    }

    if params.name != KDF_NAME {
        return Err("Unsupported KDF.".to_string());
    }

    if salt.len() < 16 {
        return Err("KDF salt is too short.".to_string());
    }

    let memory_kib = params
        .memory_mib
        .checked_mul(1024)
        .ok_or_else(|| "Invalid KDF memory cost.".to_string())?;

    let argon2_params = Params::new(
        memory_kib,
        params.iterations,
        params.parallelism,
        Some(KEY_LEN),
    )
    .map_err(|_| "Invalid KDF parameters.".to_string())?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, argon2_params);

    let mut output = [0_u8; KEY_LEN];

    argon2
        .hash_password_into(master_password.as_bytes(), salt, &mut output)
        .map_err(|_| "Could not derive key.".to_string())?;

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generates_expected_salt_length() {
        let salt = generate_kdf_salt();

        assert_eq!(salt.len(), KDF_SALT_LEN);
    }

    #[test]
    fn derives_same_key_for_same_password_salt_and_params() {
        let params = KdfParams::test_fast();
        let salt = [7_u8; KDF_SALT_LEN];

        let first = derive_key_encryption_key("correct horse battery staple", &salt, &params)
            .expect("first key should derive");

        let second = derive_key_encryption_key("correct horse battery staple", &salt, &params)
            .expect("second key should derive");

        assert_eq!(first, second);
    }

    #[test]
    fn derives_different_keys_for_different_salts() {
        let params = KdfParams::test_fast();

        let first = derive_key_encryption_key(
            "correct horse battery staple",
            &[1_u8; KDF_SALT_LEN],
            &params,
        )
        .expect("first key should derive");

        let second = derive_key_encryption_key(
            "correct horse battery staple",
            &[2_u8; KDF_SALT_LEN],
            &params,
        )
        .expect("second key should derive");

        assert_ne!(first, second);
    }

    #[test]
    fn rejects_unsupported_kdf_name() {
        let params = KdfParams {
            name: "pbkdf2".to_string(),
            memory_mib: 1,
            iterations: 1,
            parallelism: 1,
        };

        let result = derive_key_encryption_key(
            "correct horse battery staple",
            &[1_u8; KDF_SALT_LEN],
            &params,
        );

        assert!(result.is_err());
    }

    #[test]
    fn rejects_short_salt() {
        let params = KdfParams::test_fast();

        let result = derive_key_encryption_key("correct horse battery staple", &[1_u8; 8], &params);

        assert!(result.is_err());
    }
}
