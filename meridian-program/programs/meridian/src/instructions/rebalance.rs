use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Rebalance<'info> {
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(
        seeds = [b"mandate", vault.key().as_ref()],
        bump = mandate.bump
    )]
    pub mandate: Account<'info, Mandate>,

    /// CHECK: Mock Oracle Account
    pub oracle: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<Rebalance>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    
    // 1. Mock APY fetch from Oracle (in practice, parse oracle data)
    // Assume oracle provides: Kamino 4%, Marginfi 6%
    let kamino_apy = 400u16; 
    let marginfi_apy = 600u16;

    let mut shift_made = false;

    // 2. Logic: If Marginfi > Kamino by 1% (100 bps)
    if marginfi_apy > kamino_apy + 100 {
        // Shift 10% (1000 bps)
        if vault.kamino_alloc >= 1000 {
            vault.kamino_alloc -= 1000;
            vault.marginfi_alloc += 1000;
            shift_made = true;
        }
    }

    // 3. Respect Mandate Caps (simplified: check vs max_single_protocol_bps)
    let max_cap = ctx.accounts.mandate.max_single_protocol_bps;
    if vault.marginfi_alloc > max_cap {
        vault.marginfi_alloc = max_cap;
        // In real app, redistribute surplus
    }

    if shift_made {
        emit!(Rebalanced {
            vault: vault.key(),
            new_kamino: vault.kamino_alloc,
            new_marginfi: vault.marginfi_alloc,
            new_drift: vault.drift_alloc,
        });
    }

    Ok(())
}

#[event]
pub struct Rebalanced {
    pub vault: Pubkey,
    pub new_kamino: u16,
    pub new_marginfi: u16,
    pub new_drift: u16,
}
