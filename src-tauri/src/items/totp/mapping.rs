use crate::items::model::{VaultItemDetail, VaultItemType};
use crate::items::payloads::TotpItemEncryptedPayload;

const DEFAULT_TOTP_DESCRIPTION: &str = "TOTP";

pub fn totp_detail_from_payload(id: String, payload: TotpItemEncryptedPayload) -> VaultItemDetail {
    let description = totp_description(&payload.issuer, &payload.account);

    VaultItemDetail {
        id,
        item_type: VaultItemType::Totp,
        title: payload.title,
        description,
        username: None,
        website: None,
        password_masked: None,
        issuer: payload.issuer,
        account: Some(payload.account),
        algorithm: Some(payload.algorithm),
        digits: Some(payload.digits),
        period: Some(payload.period),
        code: None,
        expires_in: None,
        notes: payload.notes,
        is_high_security: None,
    }
}

fn totp_description(issuer: &Option<String>, account: &str) -> String {
    match issuer {
        Some(issuer) => format!("{issuer} · {account}"),
        None if !account.is_empty() => account.to_string(),
        None => DEFAULT_TOTP_DESCRIPTION.to_string(),
    }
}
