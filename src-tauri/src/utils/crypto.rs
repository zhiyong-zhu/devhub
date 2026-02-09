use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use anyhow::{anyhow, Result};
use base64::{Engine as _, engine::general_purpose::STANDARD};

/// 加密密钥（应该从安全配置或环境变量获取）
/// 注意：在生产环境中，这个密钥应该从安全的地方获取，而不是硬编码
const ENCRYPTION_KEY: &[u8; 32] = b"DevHub-Secret-Key-32-Bytes-Long!";

/// 加密密码
pub fn encrypt_password(password: &str) -> Result<String> {
    let cipher = Aes256Gcm::new(ENCRYPTION_KEY.into());
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let ciphertext = cipher
        .encrypt(&nonce, password.as_bytes())
        .map_err(|e| anyhow!("Failed to encrypt password: {}", e))?;

    // 将 nonce 和 ciphertext 组合在一起
    let mut result = nonce.to_vec();
    result.extend_from_slice(&ciphertext);

    // 使用 Base64 编码
    Ok(STANDARD.encode(&result))
}

/// 解密密码
pub fn decrypt_password(encrypted_password: &str) -> Result<String> {
    let decoded = STANDARD.decode(encrypted_password)
        .map_err(|e| anyhow!("Failed to decode base64: {}", e))?;

    // 分离 nonce 和 ciphertext
    if decoded.len() < 12 {
        return Err(anyhow!("Invalid encrypted password format"));
    }

    let (nonce_bytes, ciphertext) = decoded.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let cipher = Aes256Gcm::new(ENCRYPTION_KEY.into());
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| anyhow!("Failed to decrypt password: {}", e))?;

    String::from_utf8(plaintext)
        .map_err(|e| anyhow!("Failed to convert to string: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let password = "my_secret_password_123";
        let encrypted = encrypt_password(password).unwrap();
        let decrypted = decrypt_password(&encrypted).unwrap();

        assert_eq!(password, decrypted);
        assert_ne!(password, encrypted);
    }

    #[test]
    fn test_encrypt_different_results() {
        let password = "test_password";

        // 两次加密应该产生不同的结果（因为随机 nonce）
        let encrypted1 = encrypt_password(password).unwrap();
        let encrypted2 = encrypt_password(password).unwrap();

        assert_ne!(encrypted1, encrypted2);

        // 但解密后应该相同
        assert_eq!(password, decrypt_password(&encrypted1).unwrap());
        assert_eq!(password, decrypt_password(&encrypted2).unwrap());
    }

    #[test]
    fn test_decrypt_invalid_base64() {
        let result = decrypt_password("invalid_base64!");
        assert!(result.is_err());
    }

    #[test]
    fn test_decrypt_invalid_format() {
        let result = decrypt_password("dGVzdA=="); // "test" in base64
        assert!(result.is_err());
    }
}
