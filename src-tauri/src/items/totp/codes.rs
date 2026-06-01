use std::time::{SystemTime, UNIX_EPOCH};

use data_encoding::BASE32_NOPAD;
use hmac::{Hmac, KeyInit, Mac};
use sha1::Sha1;
use sha2::{Sha256, Sha512};

use crate::crypto::vault_key::VaultKey;
use crate::items::payloads::decrypt_totp_payload;
use crate::items::repository::VaultItemRepository;
use crate::items::totp::mapping::TOTP_ITEM_TYPE;

type HmacSha1 = Hmac<Sha1>;
type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;

pub struct GeneratedTotpCode {
    pub code: String,
    pub expires_in: u32,
}

pub fn generate_totp_code(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    vault_key: &VaultKey,
) -> Result<GeneratedTotpCode, String> {
    let file_item = repository.find_file_item(item_id)?;

    if file_item.item_type != TOTP_ITEM_TYPE {
        return Err("Unsupported item type.".to_string());
    }

    let payload = decrypt_totp_payload(&file_item, vault_key)
        .map_err(|_| "Could not generate TOTP code.".to_string())?;

    let timestamp = current_unix_timestamp()?;
    let period = u64::from(payload.period);
    let counter = timestamp / period;
    let expires_in = (period - (timestamp % period)) as u32;
    let secret = decode_base32_secret(&payload.secret)?;
    let code = generate_code(&secret, counter, &payload.algorithm, payload.digits)?;

    Ok(GeneratedTotpCode { code, expires_in })
}

fn current_unix_timestamp() -> Result<u64, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .map_err(|_| "System time is before Unix epoch.".to_string())
}

fn decode_base32_secret(secret: &str) -> Result<Vec<u8>, String> {
    BASE32_NOPAD
        .decode(secret.as_bytes())
        .map_err(|_| "Invalid TOTP secret.".to_string())
}

fn generate_code(
    secret: &[u8],
    counter: u64,
    algorithm: &str,
    digits: u8,
) -> Result<String, String> {
    let counter_bytes = counter.to_be_bytes();

    let hmac_result = match algorithm {
        "SHA1" => calculate_hmac_sha1(secret, &counter_bytes)?,
        "SHA256" => calculate_hmac_sha256(secret, &counter_bytes)?,
        "SHA512" => calculate_hmac_sha512(secret, &counter_bytes)?,
        _ => {
            return Err("Unsupported TOTP algorithm.".to_string());
        }
    };

    let truncated_value = dynamic_truncate(&hmac_result)?;
    let divisor = (10_u32).pow(u32::from(digits));
    let code = truncated_value % divisor;

    Ok(format!("{code:0width$}", width = usize::from(digits)))
}

fn calculate_hmac_sha1(secret: &[u8], message: &[u8]) -> Result<Vec<u8>, String> {
    let mut mac = HmacSha1::new_from_slice(secret)
        .map_err(|_| "Could not initialize TOTP HMAC.".to_string())?;

    mac.update(message);

    Ok(mac.finalize().into_bytes().to_vec())
}

fn calculate_hmac_sha256(secret: &[u8], message: &[u8]) -> Result<Vec<u8>, String> {
    let mut mac = HmacSha256::new_from_slice(secret)
        .map_err(|_| "Could not initialize TOTP HMAC.".to_string())?;

    mac.update(message);

    Ok(mac.finalize().into_bytes().to_vec())
}

fn calculate_hmac_sha512(secret: &[u8], message: &[u8]) -> Result<Vec<u8>, String> {
    let mut mac = HmacSha512::new_from_slice(secret)
        .map_err(|_| "Could not initialize TOTP HMAC.".to_string())?;

    mac.update(message);

    Ok(mac.finalize().into_bytes().to_vec())
}

fn dynamic_truncate(hmac_result: &[u8]) -> Result<u32, String> {
    let Some(last_byte) = hmac_result.last() else {
        return Err("Invalid TOTP HMAC result.".to_string());
    };

    let offset = usize::from(last_byte & 0x0f);

    if hmac_result.len() < offset + 4 {
        return Err("Invalid TOTP HMAC result.".to_string());
    }

    let value = ((u32::from(hmac_result[offset]) & 0x7f) << 24)
        | (u32::from(hmac_result[offset + 1]) << 16)
        | (u32::from(hmac_result[offset + 2]) << 8)
        | u32::from(hmac_result[offset + 3]);

    Ok(value)
}
