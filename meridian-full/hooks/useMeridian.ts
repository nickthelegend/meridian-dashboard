'use client'
import { useState, useCallback, useEffect } from 'react'
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getProgram, getVaultPDA, getPositionPDA } from '@/lib/anchor'
import { BN } from '@coral-xyz/anchor'
import { toast } from 'react-hot-toast'

// ── useVaults ────────────────────────────────
// Fetches all vault accounts from chain
export function useVaults() {
    const wallet = useAnchorWallet()
    const [vaults, setVaults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchVaults = useCallback(async () => {
        if (!wallet) return
        setLoading(true)
        setError(null)
        try {
            const program = getProgram(wallet)
            // Fetch all vault accounts
            const allVaults = await program.account.vault.all()
            setVaults(allVaults.map(v => ({
                publicKey: v.publicKey.toBase58(),
                ...v.account,
            })))
        } catch (e: any) {
            console.error('fetchVaults error:', e)
            setError(e.message)
            setVaults([])
        } finally {
            setLoading(false)
        }
    }, [wallet])

    useEffect(() => {
        if (wallet) fetchVaults()
    }, [wallet, fetchVaults])

    return { vaults, loading, error, refetch: fetchVaults }
}

// ── usePosition ──────────────────────────────
// Fetches user's position for a specific vault
export function usePosition(vaultPubkey: string | null) {
    const wallet = useAnchorWallet()
    const [position, setPosition] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchPosition = useCallback(async () => {
        if (!wallet || !vaultPubkey) return
        setLoading(true)
        try {
            const program = getProgram(wallet)
            const vault = new PublicKey(vaultPubkey)
            const positionPDA = getPositionPDA(vault, wallet.publicKey)
            const positionAccount = await program.account.position.fetch(positionPDA)
            setPosition(positionAccount)
        } catch {
            setPosition(null) // No position yet
        } finally {
            setLoading(false)
        }
    }, [wallet, vaultPubkey])

    useEffect(() => {
        fetchPosition()
    }, [fetchPosition])

    return { position, loading, refetch: fetchPosition }
}

// ── useDeposit ───────────────────────────────
export function useDeposit() {
    const wallet = useAnchorWallet()
    const [loading, setLoading] = useState(false)

    const deposit = useCallback(async (
        vaultPubkey: PublicKey,
        amountUsdc: number
    ) => {
        if (!wallet) {
            toast.error('Connect wallet first')
            return null
        }
        setLoading(true)
        const toastId = toast.loading('Preparing deposit...')
        try {
            const program = getProgram(wallet)
            const amount = new BN(amountUsdc * 1_000_000) // USDC 6 decimals

            // Derive PDAs
            const positionPDA = getPositionPDA(vaultPubkey, wallet.publicKey)
            const [whitelistPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('whitelist'), vaultPubkey.toBuffer()],
                program.programId
            )

            toast.loading('Awaiting wallet approval...', { id: toastId })
            
            // In a full implementation, we'd also pass the token accounts
            // For now, we use UncheckedAccount placeholders for mock protocols
            const tx = await program.methods
                .deposit(amount)
                .accounts({
                    vault: vaultPubkey,
                    position: positionPDA,
                    whitelist: whitelistPDA,
                    depositor: wallet.publicKey,
                    systemProgram: PublicKey.default,
                })
                .rpc()

            toast.success(`Deposit confirmed!`, { id: toastId })
            return tx
        } catch (e: any) {
            console.error('deposit error:', e)
            toast.error(
                e.message?.includes('whitelist') 
                    ? 'Wallet not whitelisted for this vault' 
                    : `Deposit failed: ${e.message}`, 
                { id: toastId }
            )
            return null
        } finally {
            setLoading(false)
        }
    }, [wallet])

    return { deposit, loading }
}

// ── useWithdraw ──────────────────────────────
export function useWithdraw() {
    const wallet = useAnchorWallet()
    const [loading, setLoading] = useState(false)

    const withdraw = useCallback(async (
        vaultPubkey: PublicKey,
        amountUsdc: number
    ) => {
        if (!wallet) {
            toast.error('Connect wallet first')
            return null
        }
        setLoading(true)
        const toastId = toast.loading('Preparing withdrawal...')
        try {
            const program = getProgram(wallet)
            const amount = new BN(amountUsdc * 1_000_000)
            const positionPDA = getPositionPDA(vaultPubkey, wallet.publicKey)

            toast.loading('Awaiting wallet approval...', { id: toastId })
            const tx = await program.methods
                .withdraw(amount)
                .accounts({
                    vault: vaultPubkey,
                    position: positionPDA,
                    depositor: wallet.publicKey,
                    systemProgram: PublicKey.default,
                })
                .rpc()

            toast.success('Withdrawal confirmed!', { id: toastId })
            return tx
        } catch (e: any) {
            toast.error(`Withdrawal failed: ${e.message}`, { id: toastId })
            return null
        } finally {
            setLoading(false)
        }
    }, [wallet])

    return { withdraw, loading }
}

// ── useWalletBalance ─────────────────────────
export function useWalletBalance() {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        if (!publicKey) return
        connection.getBalance(publicKey).then(bal => {
            setBalance(bal / LAMPORTS_PER_SOL)
        })
    }, [publicKey, connection])

    return balance
}
