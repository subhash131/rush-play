use anchor_lang::prelude::*;

declare_id!("1nqMq35onAx5F9uUzbq8PptHeBXDski8EC6M7gXN66e");

#[program]
pub mod solana_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Counter initialized with value: {}", counter.count);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        // Check for overflow
        counter.count = counter.count.checked_add(1).ok_or(ProgramError::ArithmeticOverflow)?;
        msg!("Counter incremented to: {}", counter.count);
        Ok(())
    }
}

// Account structures with proper documentation
#[derive(Accounts)]
#[instruction()]
pub struct Initialize<'info> {
    /// The counter account to initialize
    #[account(
        init,
        payer = user,
        space = 8 + 8, // discriminator (8) + count (u64 = 8)
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    /// The user initializing the counter and paying for the account creation
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    /// The counter account to increment
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

/// Data structure for the counter account
#[account]
#[derive(Default)]
pub struct Counter {
    pub count: u64,
}

// Custom errors
#[error_code]
pub enum ProgramError {
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
}