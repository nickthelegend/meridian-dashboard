use anchor_lang::prelude::*;

#[account]
pub struct Position {
    pub owner: Pubkey,         // 32
    pub vault: Pubkey,         // 32
    pub amount: u64,           // 8
    pub last_update: i64,      // 8
    pub bump: u8,              // 1
}

impl Position {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}
