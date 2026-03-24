use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod constants;

#[cfg(test)]
pub mod tests;

use instructions::*;
use state::vault::RiskTier;

declare_id!("FiBXeQkSGjq1WJQU4JhicwHtuWtv4SQ5pbdBzE9B1xnF");

#[program]
pub mod meridian {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, name: String, risk_tier: RiskTier) -> Result<()> {
        instructions::initialize_vault::handler(ctx, name, risk_tier)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, amount)
    }

    pub fn rebalance(ctx: Context<Rebalance>) -> Result<()> {
        instructions::rebalance::handler(ctx)
    }

    pub fn create_transaction(ctx: Context<CreateTransaction>, amount: u64) -> Result<()> {
        instructions::create_transaction::handler(ctx, amount)
    }

    pub fn approve_transaction(ctx: Context<ApproveTransaction>) -> Result<()> {
        instructions::approve_transaction::handler(ctx)
    }

    pub fn update_mandate(
        ctx: Context<UpdateMandate>,
        min_liquidity_reserve_bps: u16,
        max_single_protocol_bps: u16,
        max_drawdown_bps: u16,
    ) -> Result<()> {
        instructions::update_mandate::handler(
            ctx,
            min_liquidity_reserve_bps,
            max_single_protocol_bps,
            max_drawdown_bps,
        )
    }
}
