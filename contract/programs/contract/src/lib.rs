use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};

mod constants;
mod errors;
mod state;
use crate::{constants::*, errors::ErrorCode, state::*};

declare_id!("AzwBC7AzqaU8YDqEcyHBjBi86VG8xHSYYJDFtiR2m5jF");

#[program]
pub mod sonic_hunt {
    use super::*;

    pub fn init_master(ctx: Context<InitMaster>) -> Result<()> {
        let master = &mut ctx.accounts.master;
        let authority = &ctx.accounts.authority;
        master.owner = authority.key();
        Ok(())
    }

    pub fn add_user(ctx: Context<AddUser>, username: String) -> Result<()> {
        let user = &mut ctx.accounts.user;

        user.username = username;
        user.authority = ctx.accounts.authority.key();
        user.funds = 0;

        msg!("New user added: {}!", user.username);
        Ok(())
    }

    pub fn add_funds(ctx: Context<AddFunds>, funds: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let master = &ctx.accounts.master;
        let authority = &ctx.accounts.authority;

        // Transfer SOL from authority to master.owner
        invoke(
            &transfer(&authority.key(), &master.owner, funds),
            &[
                authority.to_account_info(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        user.funds += funds;
        msg!("Funds added successfully!");
        Ok(())
    }

    pub fn withdraw_funds(
        ctx: Context<WithdrawFunds>,
        amount: u64,
        _user_address: Pubkey,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let authority = &ctx.accounts.authority;
        let withdrawer = &ctx.accounts.withdrawer;

        // Check if user has enough funds to withdraw
        if user.funds < amount {
            return err!(ErrorCode::InsufficientFunds);
        }

        // Transfer SOL from master.owner to authority
        invoke(
            &transfer(&authority.key(), &withdrawer.key(), amount),
            &[
                authority.to_account_info(),
                withdrawer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update user's funds
        user.funds -= amount;
        msg!("Funds withdrawn successfully: {} lamports", amount);
        Ok(())
    }

    pub fn update_results(
        ctx: Context<UpdateResults>,
        value: i64,
        _user_address: Pubkey,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;

        if value >= 0 {
            user.funds = user.funds.saturating_add(value as u64);
        } else {
            let abs_value = (-value) as u64;
            user.funds = user.funds.saturating_sub(abs_value);
        }

        msg!("Funds updated successfully: {}", user.funds);
        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitMaster<'info> {
    #[account(
        init,
        seeds = [MASTER_SEED.as_bytes()],
        bump,
        payer = authority,
        space = 8 + std::mem::size_of::<Master>(),
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<User>(),
        seeds = [USER_SEED.as_bytes(), authority.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(funds: u64)]
pub struct AddFunds<'info> {
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), authority.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,

    #[account(
        seeds = [MASTER_SEED.as_bytes()],
        bump,
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, address = master.owner)]
    pub owner: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, user_address:Pubkey)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), user_address.key().as_ref()],
        bump,
        constraint = master.owner == authority.key() @ ErrorCode::Unauthorized,
    )]
    pub user: Account<'info, User>,

    #[account(
        seeds = [MASTER_SEED.as_bytes()],
        bump,
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, address = user_address)]
    pub withdrawer: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(value: i64, user_address:Pubkey)]
pub struct UpdateResults<'info> {
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), user_address.key().as_ref()],
        bump,
        constraint = master.owner == authority.key() @ ErrorCode::Unauthorized,
    )]
    pub user: Account<'info, User>,

    #[account(
        seeds = [MASTER_SEED.as_bytes()],
        bump,
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
