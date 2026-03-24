use anchor_lang::prelude::*;

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";
#[constant]
pub const POSITION_SEED: &[u8] = b"position";
#[constant]
pub const MANDATE_SEED: &[u8] = b"mandate";
#[constant]
pub const WHITELIST_SEED: &[u8] = b"whitelist";

// Limits (basis points)
pub const MAX_PERMITTED_LTV: u16 = 9000; // 90%
pub const DEFAULT_FEE_RATE: u16 = 100;  // 1%
