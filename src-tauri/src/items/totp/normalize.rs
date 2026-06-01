pub struct NormalizedTotpItem {
    pub title: String,
    pub issuer: Option<String>,
    pub account: String,
    pub secret: String,
    pub algorithm: String,
    pub digits: u8,
    pub period: u32,
    pub notes: Option<String>,
}

pub fn normalize_totp_item(
    title: String,
    issuer: Option<String>,
    account: String,
    secret: String,
    algorithm: Option<String>,
    digits: Option<u8>,
    period: Option<u32>,
    notes: Option<String>,
) -> Result<NormalizedTotpItem, String> {
    Ok(NormalizedTotpItem {
        title: normalize_required_text(title, "Title is required.")?,
        issuer: normalize_optional_text(issuer),
        account: normalize_required_text(account, "Account is required.")?,
        secret: normalize_totp_secret(secret)?,
        algorithm: normalize_totp_algorithm(algorithm)?,
        digits: normalize_totp_digits(digits)?,
        period: normalize_totp_period(period)?,
        notes: normalize_optional_text(notes),
    })
}

fn normalize_required_text(value: String, error_message: &str) -> Result<String, String> {
    let value = value.trim().to_string();

    if value.is_empty() {
        return Err(error_message.to_string());
    }

    Ok(value)
}

fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn normalize_totp_secret(value: String) -> Result<String, String> {
    let secret: String = value
        .chars()
        .filter(|character| !character.is_whitespace())
        .map(|character| character.to_ascii_uppercase())
        .collect();

    let secret = secret.trim_end_matches('=').to_string();

    if secret.is_empty() {
        return Err("TOTP secret is required.".to_string());
    }

    if secret.contains('=') {
        return Err("Enter a valid base32 TOTP secret.".to_string());
    }

    if !secret
        .chars()
        .all(|character| matches!(character, 'A'..='Z' | '2'..='7'))
    {
        return Err("Enter a valid base32 TOTP secret.".to_string());
    }

    Ok(secret)
}

fn normalize_totp_algorithm(value: Option<String>) -> Result<String, String> {
    let algorithm = value
        .map(|value| value.trim().to_ascii_uppercase())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "SHA1".to_string());

    match algorithm.as_str() {
        "SHA1" | "SHA256" | "SHA512" => Ok(algorithm),
        _ => Err("Unsupported TOTP algorithm.".to_string()),
    }
}

fn normalize_totp_digits(value: Option<u8>) -> Result<u8, String> {
    let digits = value.unwrap_or(6);

    match digits {
        6 | 8 => Ok(digits),
        _ => Err("TOTP digits must be 6 or 8.".to_string()),
    }
}

fn normalize_totp_period(value: Option<u32>) -> Result<u32, String> {
    let period = value.unwrap_or(30);

    if period == 0 || period > 3600 {
        return Err("TOTP period must be between 1 and 3600 seconds.".to_string());
    }

    Ok(period)
}
