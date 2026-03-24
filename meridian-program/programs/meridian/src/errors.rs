use anchor_lang::prelude::*;

#[error_code]
pub enum MeridianError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid mandate parameters")]
    InvalidMandate,
    #[msg("Insufficient funds in vault or position")]
    InsufficientFunds,
    #[msg("Account not in whitelist")]
    NotWhitelisted,
}
