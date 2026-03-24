use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::MeridianError;

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [b"multisig", vault.key().as_ref()],
        bump
    )]
    pub multisig: Account<'info, MultiSig>,

    pub vault: Account<'info, Vault>,

    #[account(
        init,
        payer = creator,
        space = TransactionRequest::LEN,
    )]
    pub transaction: Account<'info, TransactionRequest>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateTransaction>, amount: u64) -> Result<()> {
    if !ctx.accounts.multisig.signers.contains(&ctx.accounts.creator.key()) {
        return err!(MeridianError::Unauthorized);
    }

    let tx = &mut ctx.accounts.transaction;
    tx.multisig = ctx.accounts.multisig.key();
    tx.creator = ctx.accounts.creator.key();
    tx.amount = amount;
    tx.signers_count = 1;
    tx.approved_by = vec![ctx.accounts.creator.key()];
    tx.executed = false;

    Ok(())
}
