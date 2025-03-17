use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub authority: Pubkey,
    pub funds: u64,
    pub username: String,
}

#[account]
pub struct Master {
    pub owner: Pubkey,
}
