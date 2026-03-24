use anchor_lang::prelude::*;

#[account]
pub struct Whitelist {
    pub vault: Pubkey,         // 32
    pub authorities: Vec<Pubkey>, // 4 + (32 * N)
    pub bump: u8,              // 1
}

impl Whitelist {
    // Arbitrary limit of 10 authorities for space calculation
    pub const MAX_AUTHORITIES: usize = 10;
    pub const LEN: usize = 8 + 32 + (4 + (32 * Self::MAX_AUTHORITIES)) + 1;
}
