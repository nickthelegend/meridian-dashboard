use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::MeridianError;

#[derive(Accounts)]
pub struct UpdateMandate<'info> {
    pub admin: Signer<'info>,

    #[account(
        has_one = admin,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"mandate", vault.key().as_ref()],
        bump = mandate.bump
    )]
    pub mandate: Account<'info, Mandate>,
}

pub fn handler(
    ctx: Context<UpdateMandate>,
    min_liquidity_reserve_bps: u16,
    max_single_protocol_bps: u16,
    max_drawdown_bps: u16,
) -> Result<()> {
    // 1. Validation: liquidity_reserve cannot be set below 1000 bps (10%)
    if min_liquidity_reserve_bps < 1000 {
        return err!(MeridianError::InvalidMandate);
    }

    let mandate = &mut ctx.accounts.mandate;
    mandate.min_liquidity_reserve_bps = min_liquidity_reserve_bps;
    mandate.max_single_protocol_bps = max_single_protocol_bps;
    mandate.max_drawdown_bps = max_drawdown_bps;

    emit!(MandateUpdated {
        vault: ctx.accounts.vault.key(),
        min_liquidity: min_liquidity_reserve_bps,
        max_single: max_single_protocol_bps,
    });

    Ok(())
}

#[event]
pub struct MandateUpdated {
    pub vault: Pubkey,
    pub min_liquidity: u16,
    pub max_single: u16,
}
