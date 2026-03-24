use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::MeridianError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"position", vault.key().as_ref(), depositor.key().as_ref()],
        bump = position.bump,
        constraint = position.amount > 0 @ MeridianError::InsufficientFunds
    )]
    pub position: Account<'info, Position>,

    #[account(
        seeds = [b"mandate", vault.key().as_ref()],
        bump = mandate.bump
    )]
    pub mandate: Account<'info, Mandate>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let position = &mut ctx.accounts.position;
    let mandate = &ctx.accounts.mandate;

    // 1. Check amount
    if amount > position.amount {
        return err!(MeridianError::InsufficientFunds);
    }

    // 2. Liquidity Reserve Enforcement
    // Check if vault token account has enough USDC (simplified liquidity check)
    let available_liquid = ctx.accounts.vault_token_account.amount;
    if amount > available_liquid {
        return err!(MeridianError::InsufficientFunds); // Or InsufficientLiquidity custom error
    }

    // 3. Yield Calculation (Mock: 8% APR pro-rated)
    let now = Clock::get()?.unix_timestamp;
    let duration = (now - position.last_update).max(0) as u128;
    let year_seconds = 31_536_000u128;
    let apr_bps = 800u128; // 8%
    
    let yield_earned = (amount as u128 * apr_bps * duration / (10000 * year_seconds)) as u64;
    let total_transfer = amount.checked_add(yield_earned).unwrap();

    // 4. Transfer funds from Vault to Depositor
    let admin_pubkey = vault.admin;
    let seeds = &[
        b"vault",
        admin_pubkey.as_ref(),
        &[vault.vault_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.depositor_token_account.to_account_info(),
        authority: vault.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, total_transfer)?;

    // 5. Update States
    position.amount = position.amount.checked_sub(amount).unwrap();
    vault.total_deposits = vault.total_deposits.checked_sub(amount).unwrap();
    position.last_update = now;

    emit!(WithdrawalMade {
        depositor: ctx.accounts.depositor.key(),
        vault: vault.key(),
        amount: total_transfer,
        yield_amt: yield_earned,
        timestamp: now,
    });

    Ok(())
}

#[event]
pub struct WithdrawalMade {
    pub depositor: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub yield_amt: u64,
    pub timestamp: i64,
}
