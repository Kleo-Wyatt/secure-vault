use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use chacha20poly1305::{
    aead::{Aead, AeadCore, KeyInit, OsRng, Payload},
    Key, XChaCha20Poly1305, XNonce,
};
use serde::{Deserialize, Serialize};

use crate::crypto::vault_key::{VaultKey, ENCRYPTION_ALGORITHM, NONCE_LEN};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedPayload {
    pub algorithm: String,
    pub nonce: String,
    pub ciphertext: String,
}

pub fn build_item_aad(item_id: &str, item_type: &str, vault_version: u32) -> Vec<u8> {
    format!("secure-vault:item:{item_id}:version:{vault_version}:type:{item_type}").into_bytes()
}

pub fn encrypt_item_payload(
    plaintext: &[u8],
    vault_key: &VaultKey,
    aad: &[u8],
) -> Result<EncryptedPayload, String> {
    let cipher = XChaCha20Poly1305::new(Key::from_slice(vault_key));
    let nonce = XChaCha20Poly1305::generate_nonce(&mut OsRng);

    let ciphertext = cipher
        .encrypt(
            &nonce,
            Payload {
                msg: plaintext,
                aad,
            },
        )
        .map_err(|_| "Could not encrypt item payload.".to_string())?;

    Ok(EncryptedPayload {
        algorithm: ENCRYPTION_ALGORITHM.to_string(),
        nonce: BASE64.encode(nonce.as_slice()),
        ciphertext: BASE64.encode(ciphertext),
    })
}

pub fn decrypt_item_payload(
    encrypted_payload: &EncryptedPayload,
    vault_key: &VaultKey,
    aad: &[u8],
) -> Result<Vec<u8>, String> {
    if encrypted_payload.algorithm != ENCRYPTION_ALGORITHM {
        return Err("Unsupported item encryption algorithm.".to_string());
    }

    let nonce_bytes = BASE64
        .decode(&encrypted_payload.nonce)
        .map_err(|_| "Invalid item nonce.".to_string())?;

    if nonce_bytes.len() != NONCE_LEN {
        return Err("Invalid item nonce length.".to_string());
    }

    let ciphertext = BASE64
        .decode(&encrypted_payload.ciphertext)
        .map_err(|_| "Invalid item ciphertext.".to_string())?;

    let cipher = XChaCha20Poly1305::new(Key::from_slice(vault_key));

    cipher
        .decrypt(
            XNonce::from_slice(&nonce_bytes),
            Payload {
                msg: ciphertext.as_ref(),
                aad,
            },
        )
        .map_err(|_| "Could not decrypt item payload.".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encrypts_and_decrypts_item_payload() {
        let vault_key = [3_u8; 32];
        let aad = build_item_aad("item-1", "login", 1);
        let plaintext = br#"{"title":"Binance","password":"secret"}"#;

        let encrypted =
            encrypt_item_payload(plaintext, &vault_key, &aad).expect("payload should encrypt");

        let decrypted =
            decrypt_item_payload(&encrypted, &vault_key, &aad).expect("payload should decrypt");

        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn produces_different_ciphertext_for_same_payload() {
        let vault_key = [3_u8; 32];
        let aad = build_item_aad("item-1", "login", 1);
        let plaintext = br#"{"title":"Binance","password":"secret"}"#;

        let first = encrypt_item_payload(plaintext, &vault_key, &aad)
            .expect("first encryption should succeed");

        let second = encrypt_item_payload(plaintext, &vault_key, &aad)
            .expect("second encryption should succeed");

        assert_ne!(first.nonce, second.nonce);
        assert_ne!(first.ciphertext, second.ciphertext);
    }

    #[test]
    fn rejects_wrong_vault_key() {
        let correct_key = [3_u8; 32];
        let wrong_key = [4_u8; 32];
        let aad = build_item_aad("item-1", "login", 1);
        let plaintext = br#"{"title":"Binance","password":"secret"}"#;

        let encrypted =
            encrypt_item_payload(plaintext, &correct_key, &aad).expect("payload should encrypt");

        let result = decrypt_item_payload(&encrypted, &wrong_key, &aad);

        assert!(result.is_err());
    }

    #[test]
    fn rejects_wrong_aad() {
        let vault_key = [3_u8; 32];
        let correct_aad = build_item_aad("item-1", "login", 1);
        let wrong_aad = build_item_aad("item-2", "login", 1);
        let plaintext = br#"{"title":"Binance","password":"secret"}"#;

        let encrypted = encrypt_item_payload(plaintext, &vault_key, &correct_aad)
            .expect("payload should encrypt");

        let result = decrypt_item_payload(&encrypted, &vault_key, &wrong_aad);

        assert!(result.is_err());
    }

    #[test]
    fn rejects_unsupported_algorithm() {
        let vault_key = [3_u8; 32];
        let aad = build_item_aad("item-1", "login", 1);

        let encrypted = EncryptedPayload {
            algorithm: "AES-GCM".to_string(),
            nonce: BASE64.encode([1_u8; NONCE_LEN]),
            ciphertext: BASE64.encode([2_u8; 32]),
        };

        let result = decrypt_item_payload(&encrypted, &vault_key, &aad);

        assert!(result.is_err());
    }

    #[test]
    fn rejects_invalid_nonce_length() {
        let vault_key = [3_u8; 32];
        let aad = build_item_aad("item-1", "login", 1);

        let encrypted = EncryptedPayload {
            algorithm: ENCRYPTION_ALGORITHM.to_string(),
            nonce: BASE64.encode([1_u8; 12]),
            ciphertext: BASE64.encode([2_u8; 32]),
        };

        let result = decrypt_item_payload(&encrypted, &vault_key, &aad);

        assert!(result.is_err());
    }
}
