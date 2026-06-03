use std::time::{SystemTime, UNIX_EPOCH};

use data_encoding::BASE32_NOPAD;
use hmac::{Hmac, KeyInit, Mac};
use sha1::Sha1;
use sha2::{Sha256, Sha512};

use crate::crypto::vault_key::VaultKey;
use crate::items::login::mapping::LEGACY_CREDENTIAL_ITEM_TYPE;
use crate::items::payloads::{decrypt_credential_payload, decrypt_totp_payload};
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

    match file_item.item_type.as_str() {
        TOTP_ITEM_TYPE => {
            let payload = decrypt_totp_payload(&file_item, vault_key)
                .map_err(|_| "Could not generate TOTP code.".to_string())?;

            generate_code_result(
                &payload.secret,
                &payload.algorithm,
                payload.digits,
                payload.period,
            )
        }
        LEGACY_CREDENTIAL_ITEM_TYPE => {
            let payload = decrypt_credential_payload(&file_item, vault_key)
                .map_err(|_| "Could not generate TOTP code.".to_string())?;

            let Some(totp) = payload.totp else {
                return Err("Login item does not have a TOTP secret.".to_string());
            };

            generate_code_result(&totp.secret, &totp.algorithm, totp.digits, totp.period)
        }
        _ => Err("Unsupported item type.".to_string()),
    }
}

fn generate_code_result(
    secret: &str,
    algorithm: &str,
    digits: u8,
    period: u32,
) -> Result<GeneratedTotpCode, String> {
    let timestamp = current_unix_timestamp()?;
    let period = u64::from(period);
    let counter = timestamp / period;
    let expires_in = (period - (timestamp % period)) as u32;
    let secret = decode_base32_secret(secret)?;
    let code = generate_code(&secret, counter, algorithm, digits)?;

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

#[cfg(test)]
mod tests {
    use super::generate_code;

    const RFC_SECRET_SHA1: &[u8] = b"12345678901234567890";
    const RFC_SECRET_SHA256: &[u8] = b"12345678901234567890123456789012";
    const RFC_SECRET_SHA512: &[u8] =
        b"1234567890123456789012345678901234567890123456789012345678901234";

    #[test]
    fn generates_sha1_totp_codes_from_rfc_vectors() {
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 59 / 30, "SHA1", 8).unwrap(),
            "94287082"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 1_111_111_109 / 30, "SHA1", 8).unwrap(),
            "07081804"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 1_111_111_111 / 30, "SHA1", 8).unwrap(),
            "14050471"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 1_234_567_890 / 30, "SHA1", 8).unwrap(),
            "89005924"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 2_000_000_000 / 30, "SHA1", 8).unwrap(),
            "69279037"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA1, 20_000_000_000 / 30, "SHA1", 8).unwrap(),
            "65353130"
        );
    }

    #[test]
    fn generates_sha256_totp_codes_from_rfc_vectors() {
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 59 / 30, "SHA256", 8).unwrap(),
            "46119246"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 1_111_111_109 / 30, "SHA256", 8).unwrap(),
            "68084774"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 1_111_111_111 / 30, "SHA256", 8).unwrap(),
            "67062674"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 1_234_567_890 / 30, "SHA256", 8).unwrap(),
            "91819424"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 2_000_000_000 / 30, "SHA256", 8).unwrap(),
            "90698825"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA256, 20_000_000_000 / 30, "SHA256", 8).unwrap(),
            "77737706"
        );
    }

    #[test]
    fn generates_sha512_totp_codes_from_rfc_vectors() {
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 59 / 30, "SHA512", 8).unwrap(),
            "90693936"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 1_111_111_109 / 30, "SHA512", 8).unwrap(),
            "25091201"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 1_111_111_111 / 30, "SHA512", 8).unwrap(),
            "99943326"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 1_234_567_890 / 30, "SHA512", 8).unwrap(),
            "93441116"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 2_000_000_000 / 30, "SHA512", 8).unwrap(),
            "38618901"
        );
        assert_eq!(
            generate_code(RFC_SECRET_SHA512, 20_000_000_000 / 30, "SHA512", 8).unwrap(),
            "47863826"
        );
    }

    #[test]
    fn formats_six_digit_codes_with_leading_zeroes() {
        let code = generate_code(RFC_SECRET_SHA1, 1_111_111_109 / 30, "SHA1", 6).unwrap();

        assert_eq!(code.len(), 6);
        assert!(code.chars().all(|character| character.is_ascii_digit()));
    }

    #[test]
    fn rejects_unsupported_algorithm() {
        let result = generate_code(RFC_SECRET_SHA1, 59 / 30, "MD5", 6);

        assert_eq!(result.unwrap_err(), "Unsupported TOTP algorithm.");
    }
}
