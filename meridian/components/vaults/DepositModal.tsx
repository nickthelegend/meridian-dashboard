'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import { useDeposit } from '@/hooks/useMeridian'

interface DepositModalProps {
    open: boolean
    onClose: () => void
    vault: {
        publicKey: string
        name: string
        apy: number
        tier: string
    } | null
}

export function DepositModal({ open, onClose, vault }: DepositModalProps) {
    const [amount, setAmount] = useState('')
    const [txSig, setTxSig] = useState<string | null>(null)
    const { deposit, loading } = useDeposit()

    if (!vault) return null

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount))) return
        const sig = await deposit(
            new PublicKey(vault.publicKey),
            Number(amount)
        )
        if (sig) setTxSig(sig)
    }

    const estimatedDailyYield = (
        (Number(amount) || 0) * (vault.apy / 100 / 365)
    ).toFixed(2)

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" 
                    />
                    
                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
                    >
                        <div className="bg-[#0F0F17] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E2E]">
                                <div>
                                    <h2 className="font-heading font-bold text-lg text-white">
                                        Deposit to {vault.name}
                                    </h2>
                                    <p className="text-xs text-[#6B7280] mt-0.5">
                                        Earning {vault.apy}% APY · Devnet
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1A1A2E] text-[#6B7280] hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {!txSig ? (
                                <div className="p-6 space-y-5">
                                    {/* Amount input */}
                                    <div>
                                        <label className="text-xs text-[#6B7280] uppercase tracking-wider font-mono mb-2 block">
                                            Amount (USDC)
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={amount} 
                                                onChange={e => setAmount(e.target.value)} 
                                                placeholder="0.00" 
                                                className="w-full bg-[#111118] border border-[#2A2A3E] rounded-xl px-4 py-3.5 pr-20 text-xl font-heading font-bold text-white placeholder:text-[#374151] focus:outline-none focus:border-[#C9A84C44] transition-colors" 
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-[#6B7280]">
                                                USDC
                                            </div>
                                        </div>
                                        {/* Quick amounts */}
                                        <div className="flex gap-2 mt-2">
                                            {['1,000', '10,000', '50,000', '100,000'].map(amt => (
                                                <button 
                                                    key={amt} 
                                                    onClick={() => setAmount(amt.replace(',', ''))}
                                                    className="flex-1 py-1.5 rounded-lg text-xs bg-[#111118] border border-[#1E1E2E] text-[#6B7280] hover:text-[#C9A84C] hover:border-[#C9A84C33] transition-colors font-mono"
                                                >
                                                    ${amt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Yield preview */}
                                    {Number(amount) > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#C9A84C08] border border-[#C9A84C22]">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-[#6B7280]">Estimated daily yield</span>
                                                <span className="text-[#C9A84C] font-mono font-bold">+${estimatedDailyYield} USDC</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-[#6B7280]">APY</span>
                                                <span className="text-[#10B981] font-mono font-bold">{vault.apy}%</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Warning */}
                                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F59E0B08] border border-[#F59E0B22]">
                                        <AlertCircle size={14} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                                            Devnet only. Your wallet must be whitelisted by the vault admin before depositing.
                                        </p>
                                    </div>

                                    {/* Confirm button */}
                                    <motion.button 
                                        whileHover={{ scale: 1.01, boxShadow: '0 0 24px rgba(201, 168, 76, 0.2)' }} 
                                        whileTap={{ scale: 0.99 }} 
                                        onClick={handleDeposit} 
                                        disabled={loading || !amount || Number(amount) <= 0}
                                        className="w-full py-3.5 rounded-xl font-heading font-bold text-[#0A0A0F] bg-gradient-to-r from-[#C9A84C] to-[#A07830] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Deposit <ArrowRight size={16} />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            ) : (
                                /* Success state */
                                <div className="p-8 text-center space-y-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="w-16 h-16 rounded-full bg-[#10B98115] border border-[#10B98133] flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={32} className="text-[#10B981]" />
                                    </motion.div>
                                    <div>
                                        <h3 className="font-heading font-bold text-xl text-white mb-2">Deposit Confirmed!</h3>
                                        <p className="text-[#6B7280] text-sm">Your USDC is now earning {vault.apy}% APY</p>
                                    </div>
                                    <a 
                                        href={`https://solscan.io/tx/${txSig}?cluster=devnet`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#E8D5A3] transition-colors"
                                    >
                                        View on Solscan <ExternalLink size={14} />
                                    </a>
                                    <button onClick={onClose} className="w-full py-3 rounded-xl border border-[#2A2A3E] text-[#6B7280] hover:text-white hover:border-[#374151] transition-colors text-sm font-medium">
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
