use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::MeridianError;

#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"multisig", vault.key().as_ref()],
        bump
    )]
    pub multisig: Account<'info, MultiSig>,

    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub transaction: Account<'info, TransactionRequest>,
}

pub fn handler(ctx: Context<ApproveTransaction>) -> Result<()> {
    if !ctx.accounts.multisig.signers.contains(&ctx.accounts.signer.key()) {
        return err!(MeridianError::Unauthorized);
    }

    let tx = &mut ctx.accounts.transaction;
    if tx.approved_by.contains(&ctx.accounts.signer.key()) {
        return err!(MeridianError::Unauthorized); // Already approved
    }

    tx.approved_by.push(ctx.accounts.signer.key());
    tx.signers_count += 1;

    Ok(())
}
