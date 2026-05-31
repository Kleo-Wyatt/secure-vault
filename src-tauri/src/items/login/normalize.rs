pub fn normalize_required_title(title: &str) -> Result<String, String> {
    let title = title.trim().to_string();

    if title.is_empty() {
        return Err("Title is required.".to_string());
    }

    Ok(title)
}

pub fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

pub fn normalize_optional_website(value: Option<String>) -> Result<Option<String>, String> {
    let Some(website) = normalize_optional_text(value) else {
        return Ok(None);
    };

    validate_login_website(&website)?;

    Ok(Some(website))
}

fn validate_login_website(value: &str) -> Result<(), String> {
    if value.chars().any(char::is_whitespace) {
        return Err("Enter a valid website URL.".to_string());
    }

    let host_port = extract_host_port(value)?;
    let (host, port) = split_host_port(host_port)?;

    if !is_valid_domain(host) {
        return Err("Enter a valid website domain.".to_string());
    }

    if let Some(port) = port {
        if !is_valid_port(port) {
            return Err("Enter a valid website port.".to_string());
        }
    }

    Ok(())
}

fn extract_host_port(value: &str) -> Result<&str, String> {
    let address = match split_url_scheme(value) {
        Some((scheme, rest)) => {
            if scheme != "http" && scheme != "https" {
                return Err("Website must use http or https.".to_string());
            }

            rest.strip_prefix("//")
                .ok_or_else(|| "Enter a valid website URL.".to_string())?
        }
        None => value,
    };

    let host_end = address
        .find(|character| matches!(character, '/' | '?' | '#'))
        .unwrap_or(address.len());

    let host_port = &address[..host_end];

    if host_port.is_empty() || host_port.contains('@') {
        return Err("Enter a valid website URL.".to_string());
    }

    Ok(host_port)
}

fn split_host_port(host_port: &str) -> Result<(&str, Option<&str>), String> {
    if host_port.starts_with('[') {
        return Err("Enter a valid website domain.".to_string());
    }

    let Some(port_start) = host_port.rfind(':') else {
        return Ok((host_port, None));
    };

    let host = &host_port[..port_start];
    let port = &host_port[port_start + 1..];

    if host.is_empty() || port.is_empty() {
        return Err("Enter a valid website URL.".to_string());
    }

    Ok((host, Some(port)))
}

fn split_url_scheme(value: &str) -> Option<(&str, &str)> {
    let scheme_end = value.find(':')?;
    let first_separator = value
        .find(|character| matches!(character, '/' | '?' | '#'))
        .unwrap_or(value.len());

    if scheme_end > first_separator {
        return None;
    }

    let scheme = &value[..scheme_end];

    if !is_valid_url_scheme(scheme) {
        return None;
    }

    Some((scheme, &value[scheme_end + 1..]))
}

fn is_valid_url_scheme(value: &str) -> bool {
    let mut characters = value.chars();

    let Some(first_character) = characters.next() else {
        return false;
    };

    first_character.is_ascii_alphabetic()
        && characters.all(|character| {
            character.is_ascii_alphanumeric()
                || character == '+'
                || character == '.'
                || character == '-'
        })
}

fn is_valid_domain(hostname: &str) -> bool {
    let normalized_hostname = hostname.to_lowercase();

    if !normalized_hostname.contains('.') {
        return false;
    }

    let labels: Vec<&str> = normalized_hostname.split('.').collect();
    let top_level_domain = labels[labels.len() - 1];

    labels.iter().all(|label| is_valid_domain_label(label))
        && is_valid_top_level_domain(top_level_domain)
}

fn is_valid_domain_label(label: &&str) -> bool {
    let is_allowed_character =
        |character: char| character.is_ascii_alphanumeric() || character == '-';

    !label.is_empty()
        && label.len() <= 63
        && label.chars().all(is_allowed_character)
        && label
            .chars()
            .next()
            .is_some_and(|character| character.is_ascii_alphanumeric())
        && label
            .chars()
            .last()
            .is_some_and(|character| character.is_ascii_alphanumeric())
}

fn is_valid_top_level_domain(value: &str) -> bool {
    value.len() >= 2
        && value
            .chars()
            .all(|character| character.is_ascii_alphabetic())
}

fn is_valid_port(value: &str) -> bool {
    value.parse::<u16>().map(|port| port > 0).unwrap_or(false)
}
