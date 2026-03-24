import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey(
    'FiBXeQkSGjq1WJQU4JhicwHtuWtv4SQ5pbdBzE9B1xnF'
)

export const DEVNET_RPC = 'https://api.devnet.solana.com'

// Devnet USDC mint (Circle's official devnet USDC)
export const USDC_MINT = new PublicKey(
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
)

export const SEEDS = {
    VAULT: 'vault',
    POSITION: 'position',
    MANDATE: 'mandate',
    WHITELIST: 'whitelist',
}
