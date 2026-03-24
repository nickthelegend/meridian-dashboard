use anchor_lang::prelude::*;

#[account]
pub struct MultiSig {
    pub vault: Pubkey,
    pub threshold: u8,
    pub signers: Vec<Pubkey>,
    pub total_signers: u8,
    pub bump: u8,
}

impl MultiSig {
    pub const MAX_SIGNERS: usize = 10;
    pub const LEN: usize = 8 + 32 + 1 + (4 + (32 * Self::MAX_SIGNERS)) + 1 + 1;
}

#[account]
pub struct TransactionRequest {
    pub multisig: Pubkey,
    pub creator: Pubkey,
    pub amount: u64,
    pub signers_count: u8,
    pub approved_by: Vec<Pubkey>,
    pub executed: bool,
}

impl TransactionRequest {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + (4 + (32 * 10)) + 1;
}
