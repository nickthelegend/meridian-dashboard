use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String, risk_tier: RiskTier)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = Vault::LEN,
        seeds = [b"vault", admin.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = token_mint,
        token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        space = Mandate::LEN,
        seeds = [b"mandate", vault.key().as_ref()],
        bump
    )]
    pub mandate: Account<'info, Mandate>,

    #[account(
        init,
        payer = admin,
        space = Whitelist::LEN,
        seeds = [b"whitelist", vault.key().as_ref()],
        bump
    )]
    pub whitelist: Account<'info, Whitelist>,

    #[account(
        init,
        payer = admin,
        space = MultiSig::LEN,
        seeds = [b"multisig", vault.key().as_ref()],
        bump
    )]
    pub multisig: Account<'info, MultiSig>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeVault>, name: String, risk_tier: RiskTier) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let mandate = &mut ctx.accounts.mandate;
    let whitelist = &mut ctx.accounts.whitelist;
    let multisig = &mut ctx.accounts.multisig;

    vault.admin = ctx.accounts.admin.key();
    let mut name_bytes = [0u8; 32];
    let name_slice = name.as_bytes();
    let len = name_slice.len().min(32);
    name_bytes[..len].copy_from_slice(&name_slice[..len]);
    vault.name = name_bytes;
    vault.risk_tier = risk_tier;
    vault.token_mint = ctx.accounts.token_mint.key();
    vault.token_account = ctx.accounts.vault_token_account.key();
    vault.total_deposits = 0;
    vault.vault_bump = ctx.bumps.vault;
    vault.created_at = Clock::get()?.unix_timestamp;

    match risk_tier {
        RiskTier::Conservative => {
            vault.kamino_alloc = 8000;
            vault.marginfi_alloc = 2000;
            vault.drift_alloc = 0;
        }
        RiskTier::Balanced => {
            vault.kamino_alloc = 6000;
            vault.marginfi_alloc = 4000;
            vault.drift_alloc = 0;
        }
        RiskTier::Aggressive => {
            vault.kamino_alloc = 4000;
            vault.marginfi_alloc = 4000;
            vault.drift_alloc = 2000;
        }
    }

    mandate.vault = vault.key();
    mandate.min_liquidity_reserve_bps = 1000;
    mandate.max_single_protocol_bps = 8000;
    mandate.max_drawdown_bps = 500;
    mandate.bump = ctx.bumps.mandate;

    whitelist.vault = vault.key();
    whitelist.authorities = vec![ctx.accounts.admin.key()];
    whitelist.bump = ctx.bumps.whitelist;

    multisig.vault = vault.key();
    multisig.threshold = 1;
    multisig.signers = vec![ctx.accounts.admin.key()];
    multisig.total_signers = 1;
    multisig.bump = ctx.bumps.multisig;

    emit!(VaultInitialized {
        vault: vault.key(),
        admin: vault.admin,
        risk_tier,
    });

    Ok(())
}

#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub admin: Pubkey,
    pub risk_tier: RiskTier,
}
