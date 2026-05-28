use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use chacha20poly1305::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Key, XChaCha20Poly1305, XNonce,
};
use serde::{Deserialize, Serialize};

pub const VAULT_KEY_LEN: usize = 32;
pub const NONCE_LEN: usize = 24;
pub const ENCRYPTION_ALGORITHM: &str = "XChaCha20-Poly1305";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedVaultKey {
    pub algorithm: String,
    pub nonce: String,
    pub ciphertext: String,
}

pub fn generate_vault_key() -> [u8; VAULT_KEY_LEN] {
    XChaCha20Poly1305::generate_key(&mut OsRng).into()
}

pub fn encrypt_vault_key(
    vault_key: &[u8; VAULT_KEY_LEN],
    key_encryption_key: &[u8; VAULT_KEY_LEN],
) -> Result<EncryptedVaultKey, String> {
    let cipher = XChaCha20Poly1305::new(Key::from_slice(key_encryption_key));
    let nonce = XChaCha20Poly1305::generate_nonce(&mut OsRng);

    let ciphertext = cipher
        .encrypt(&nonce, vault_key.as_ref())
        .map_err(|_| "Could not encrypt vault key.".to_string())?;

    Ok(EncryptedVaultKey {
        algorithm: ENCRYPTION_ALGORITHM.to_string(),
        nonce: BASE64.encode(nonce.as_slice()),
        ciphertext: BASE64.encode(ciphertext),
    })
}

pub fn decrypt_vault_key(
    encrypted_vault_key: &EncryptedVaultKey,
    key_encryption_key: &[u8; VAULT_KEY_LEN],
) -> Result<[u8; VAULT_KEY_LEN], String> {
    if encrypted_vault_key.algorithm != ENCRYPTION_ALGORITHM {
        return Err("Unsupported vault key encryption algorithm.".to_string());
    }

    let nonce_bytes = BASE64
        .decode(&encrypted_vault_key.nonce)
        .map_err(|_| "Invalid vault key nonce.".to_string())?;

    if nonce_bytes.len() != NONCE_LEN {
        return Err("Invalid vault key nonce length.".to_string());
    }

    let ciphertext = BASE64
        .decode(&encrypted_vault_key.ciphertext)
        .map_err(|_| "Invalid vault key ciphertext.".to_string())?;

    let cipher = XChaCha20Poly1305::new(Key::from_slice(key_encryption_key));

    let plaintext = cipher
        .decrypt(XNonce::from_slice(&nonce_bytes), ciphertext.as_ref())
        .map_err(|_| "Could not decrypt vault key.".to_string())?;

    if plaintext.len() != VAULT_KEY_LEN {
        return Err("Invalid vault key length.".to_string());
    }

    let mut vault_key = [0_u8; VAULT_KEY_LEN];
    vault_key.copy_from_slice(&plaintext);

    Ok(vault_key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generates_expected_vault_key_length() {
        let vault_key = generate_vault_key();

        assert_eq!(vault_key.len(), VAULT_KEY_LEN);
    }

    #[test]
    fn encrypts_and_decrypts_vault_key() {
        let vault_key = [7_u8; VAULT_KEY_LEN];
        let key_encryption_key = [3_u8; VAULT_KEY_LEN];

        let encrypted =
            encrypt_vault_key(&vault_key, &key_encryption_key).expect("vault key should encrypt");

        let decrypted =
            decrypt_vault_key(&encrypted, &key_encryption_key).expect("vault key should decrypt");

        assert_eq!(decrypted, vault_key);
    }

    #[test]
    fn produces_different_ciphertext_for_same_vault_key() {
        let vault_key = [7_u8; VAULT_KEY_LEN];
        let key_encryption_key = [3_u8; VAULT_KEY_LEN];

        let first = encrypt_vault_key(&vault_key, &key_encryption_key)
            .expect("first encryption should succeed");

        let second = encrypt_vault_key(&vault_key, &key_encryption_key)
            .expect("second encryption should succeed");

        assert_ne!(first.nonce, second.nonce);
        assert_ne!(first.ciphertext, second.ciphertext);
    }

    #[test]
    fn rejects_wrong_key_encryption_key() {
        let vault_key = [7_u8; VAULT_KEY_LEN];
        let correct_key = [3_u8; VAULT_KEY_LEN];
        let wrong_key = [4_u8; VAULT_KEY_LEN];

        let encrypted =
            encrypt_vault_key(&vault_key, &correct_key).expect("vault key should encrypt");

        let result = decrypt_vault_key(&encrypted, &wrong_key);

        assert!(result.is_err());
    }

    #[test]
    fn rejects_unsupported_algorithm() {
        let encrypted = EncryptedVaultKey {
            algorithm: "AES-GCM".to_string(),
            nonce: BASE64.encode([1_u8; NONCE_LEN]),
            ciphertext: BASE64.encode([2_u8; VAULT_KEY_LEN]),
        };

        let result = decrypt_vault_key(&encrypted, &[3_u8; VAULT_KEY_LEN]);

        assert!(result.is_err());
    }
}
