import { Program, AnchorProvider, Idl, setProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import idl from './idl/meridian.json'
import { PROGRAM_ID, SEEDS, DEVNET_RPC } from './constants'

export function getProvider(wallet: AnchorWallet) {
    const connection = new Connection(DEVNET_RPC, 'confirmed')
    const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
    )
    setProvider(provider)
    return provider
}

export function getProgram(wallet: AnchorWallet) {
    const provider = getProvider(wallet)
    return new Program(idl as Idl, PROGRAM_ID, provider)
}

// ── PDA Helpers ──────────────────────────────

export function getVaultPDA(adminPubkey: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.VAULT), adminPubkey.toBuffer()],
        PROGRAM_ID
    )[0]
}

export function getPositionPDA(
    vaultPubkey: PublicKey,
    depositorPubkey: PublicKey
) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(SEEDS.POSITION),
            vaultPubkey.toBuffer(),
            depositorPubkey.toBuffer(),
        ],
        PROGRAM_ID
    )[0]
}

export function getMandatePDA(vaultPubkey: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.MANDATE), vaultPubkey.toBuffer()],
        PROGRAM_ID
    )[0]
}

export function getWhitelistPDA(vaultPubkey: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.WHITELIST), vaultPubkey.toBuffer()],
        PROGRAM_ID
    )[0]
}
