use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,

    #[msg("Unauthorized: Only the user's authority can withdraw funds")]
    Unauthorized,
}
