use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::MeridianError;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = depositor,
        space = Position::LEN,
        seeds = [b"position", vault.key().as_ref(), depositor.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(
        seeds = [b"whitelist", vault.key().as_ref()],
        bump = whitelist.bump
    )]
    pub whitelist: Account<'info, Whitelist>,

    #[account(
        seeds = [b"multisig", vault.key().as_ref()],
        bump = multisig.bump
    )]
    pub multisig: Account<'info, MultiSig>,

    /// CHECK: Optional transaction request for > 1M USDC deposits
    #[account(mut)]
    pub transaction: UncheckedAccount<'info>,

    /// CHECK: Placeholder for mock CPI accounts
    pub kamino_account: UncheckedAccount<'info>,
    /// CHECK: Placeholder for mock CPI accounts
    pub marginfi_account: UncheckedAccount<'info>,
    /// CHECK: Placeholder for mock CPI accounts
    pub drift_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // 1. Whitelist Check
    if !ctx.accounts.whitelist.authorities.contains(&ctx.accounts.depositor.key()) {
        return err!(MeridianError::NotWhitelisted);
    }

    // 2. Multi-sig Check (amount > 1,000,000 USDC)
    if amount > 1_000_000_000_000 { 
         let tx_info = &ctx.accounts.transaction.to_account_info();
         if tx_info.data_is_empty() {
             return err!(MeridianError::Unauthorized); // Needs multi-sig req
         }
         
         let tx_data = tx_info.try_borrow_data()?;
         let mut data_ptr = &tx_data[8..]; // Skip discriminator
         let tx_request = TransactionRequest::deserialize(&mut data_ptr)?;
         
         if tx_request.signers_count < ctx.accounts.multisig.threshold {
             return err!(MeridianError::Unauthorized); // Not enough signers
         }
         if tx_request.executed {
             return err!(MeridianError::Unauthorized); // Already used
         }
    }

    // 3. Transfer USDC to Vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.depositor_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.depositor.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // 4. Update Position State
    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.depositor.key();
    position.vault = ctx.accounts.vault.key();
    position.amount = position.amount.checked_add(amount).unwrap();
    position.last_update = Clock::get()?.unix_timestamp;
    position.bump = ctx.bumps.position;

    // 5. Update Vault TVL
    ctx.accounts.vault.total_deposits = ctx.accounts.vault.total_deposits.checked_add(amount).unwrap();

    // 6. Mock Routing to Protocols
    let kamino_alloc = ctx.accounts.vault.kamino_alloc;
    let marginfi_alloc = ctx.accounts.vault.marginfi_alloc;
    let drift_alloc = ctx.accounts.vault.drift_alloc;

    let kamino_amt = (amount as u128 * kamino_alloc as u128 / 10000) as u64;
    let marginfi_amt = (amount as u128 * marginfi_alloc as u128 / 10000) as u64;
    let drift_amt = (amount as u128 * drift_alloc as u128 / 10000) as u64;

    emit!(DepositMade {
        depositor: ctx.accounts.depositor.key(),
        vault: ctx.accounts.vault.key(),
        amount,
        kamino_amt,
        marginfi_amt,
        drift_amt,
        timestamp: position.last_update,
    });

    Ok(())
}

#[event]
pub struct DepositMade {
    pub depositor: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub kamino_amt: u64,
    pub marginfi_amt: u64,
    pub drift_amt: u64,
    pub timestamp: i64,
}
