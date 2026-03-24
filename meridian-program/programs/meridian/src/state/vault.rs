use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RiskTier {
    Conservative,
    Balanced,
    Aggressive,
}

#[account]
pub struct Vault {
    pub admin: Pubkey,            // 32
    pub name: [u8; 32],           // 32
    pub risk_tier: RiskTier,      // 1
    pub token_mint: Pubkey,       // 32
    pub token_account: Pubkey,    // 32
    pub total_deposits: u64,      // 8
    pub kamino_alloc: u16,        // 2 (bps)
    pub marginfi_alloc: u16,      // 2 (bps)
    pub drift_alloc: u16,         // 2 (bps)
    pub vault_bump: u8,           // 1
    pub created_at: i64,          // 8
}

impl Vault {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 32 + 32 + 8 + 2 + 2 + 2 + 1 + 8;
}
