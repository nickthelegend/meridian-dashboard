import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletButton } from '@/components/ui/WalletButton'
import { TrendingUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Governance', href: '/governance' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' }
]

export function TopNav() {
    const pathname = usePathname()
    
    return (
        <motion.header 
            initial={{ y: -60, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.4, ease: 'easeOut' }} 
            className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
                {/* LEFT — Logo */}
                <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] flex items-center justify-center shadow-lg">
                        <span className="text-black text-sm font-bold">M</span>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-white via-white to-[#8B949E] bg-clip-text text-transparent tracking-wide">
                        MERIDIAN
                    </span>
                </Link>

                {/* CENTER — Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const active = pathname?.startsWith(link.href)
                        return (
                            <Link key={link.href} href={link.href}>
                                <div className={`
                                    flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                                    ${active 
                                        ? 'text-[#D4AF37] bg-[#D4AF37]/10' 
                                        : 'text-[#8B949E] hover:text-white hover:bg-white/5'
                                    }
                                `}>
                                    {link.label}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* RIGHT — Stats + Wallet */}
                <div className="flex items-center gap-3">
                    {/* TVL Pill */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <TrendingUp size={13} className="text-[#D4AF37]" />
                        <span className="text-xs font-mono text-[#8B949E]">TVL</span>
                        <span className="text-xs font-mono font-semibold text-white">$15.05M</span>
                    </div>
                    
                    {/* Best APY Pill */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B98111] border border-[#10B98133]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-xs font-mono text-[#10B981] font-semibold">
                            Best APY 14.1%
                        </span>
                    </div>

                    {/* Network badge */}
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        <span className="text-xs font-mono text-[#6B7280]">Devnet</span>
                    </div>
                    <WalletButton />
                </div>
            </div>
            {/* Gold accent line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF3733] to-transparent" />
        </motion.header>
    )
}
