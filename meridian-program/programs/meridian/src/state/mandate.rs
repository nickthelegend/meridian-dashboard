use anchor_lang::prelude::*;

#[account]
pub struct Mandate {
    pub vault: Pubkey,                // 32
    pub min_liquidity_reserve_bps: u16, // 2
    pub max_single_protocol_bps: u16,  // 2
    pub max_drawdown_bps: u16,        // 2
    pub whitelisted_protocols: [u8; 64], // 64 (fixed size for simplicity)
    pub bump: u8,                     // 1
}

impl Mandate {
    pub const LEN: usize = 8 + 32 + 2 + 2 + 2 + 64 + 1;
}
