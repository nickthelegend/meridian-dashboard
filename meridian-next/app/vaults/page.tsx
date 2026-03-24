'use client'
import { PageLayout } from '@/components/layout/PageLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Search, Star, SlidersHorizontal, ChevronDown, ChevronUp, ArrowUpDown, Bookmark, X, Eye, EyeOff } from 'lucide-react'
import { DepositModal } from '@/components/vaults/DepositModal'
import { useVaults } from '@/hooks/useMeridian'

// SECTION A — MOCK DATA
const PROTOCOLS = [
    { name: 'Kamino', emoji: '🛡️' },
    { name: 'Marginfi', emoji: '💎' },
    { name: 'Drift', emoji: '⚡' },
    { name: 'Jito', emoji: '🎯' },
    { name: 'Ondo', emoji: '🏛' },
    { name: 'Solend', emoji: '🏦' },
    { name: 'Jupiter', emoji: '🪐' }
]

const MOCK_VAULTS = [
    {
        id: 'usdc-kamino',
        publicKey: 'usdc-kamino-mock-key',
        name: 'USDC-KAMINO',
        icon: '🛡️',
        iconBg: '#0D1117',
        tier: 'conservative',
        apy: 7.24,
        daily: 0.0198,
        tvl: 4200000,
        tvlSub: 'Liquidity',
        deposited: 250000,
        boosted: false,
        new: false,
        saved: false,
        tags: ['USDC', 'KAMINO']
    },
    {
        id: 'usdc-multi',
        publicKey: 'usdc-multi-mock-key',
        name: 'USDC-MULTI',
        icon: '🏦',
        iconBg: '#1A1A3A',
        tier: 'balanced',
        apy: 9.41,
        daily: 0.0258,
        tvl: 8750000,
        tvlSub: 'Liquidity',
        deposited: 0,
        boosted: true,
        new: true,
        saved: false,
        tags: ['USDC', 'MULTI-PROTOCOL']
    },
    {
        id: 'usdc-alpha',
        publicKey: 'usdc-alpha-mock-key',
        name: 'USDC-ALPHA',
        icon: '⚡️',
        iconBg: '#2A1A1A',
        tier: 'aggressive',
        apy: 14.10,
        daily: 0.0387,
        tvl: 2100000,
        tvlSub: 'Liquidity',
        deposited: 0,
        boosted: true,
        new: true,
        saved: true,
        tags: ['USDC', 'DRIFT']
    },
]

const PLATFORM_STATS = [
    { label: 'Vaults', value: '142' },
    { label: 'TVL', value: '$15.05M', sub: '+12%' },
    { label: 'Weekly Yield', value: '$42.5K', sub: '7d' },
    { label: 'Weekly Revenue', value: '$8.2K', sub: '7d' },
    { label: 'Weekly Buyback', value: '$1.4K', sub: '7d' }
]

const FILTER_PILLS = [ 'All', 'Saved', 'My Positions', 'Boosted 🔥', 'Stablecoins', 'Blue Chips', 'Single', 'Vaults', 'Pools' ]

const TIER_CONFIG: Record<string, any> = {
    conservative: { label: 'CONSERVATIVE', color: '#10B981', bg: '#10B98115', border: '#10B98130' },
    balanced: { label: 'BALANCED', color: '#C9A84C', bg: '#C9A84C15', border: '#C9A84C30' },
    aggressive: { label: 'AGGRESSIVE', color: '#EF4444', bg: '#EF444415', border: '#EF444430' },
}

function fmtTVL(n: number) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
    return `$${n}`
}

export default function VaultsPage() {
    const { vaults: chainVaults, loading: vaultsLoading } = useVaults()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [sortKey, setSortKey] = useState<'apy'|'daily'|'tvl'|'deposited'>('tvl')
    const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
    const [hideBalance, setHideBalance] = useState(false)
    const [activeProtocol, setActiveProtocol] = useState<string|null>(null)
    const [selectedVault, setSelectedVault] = useState<any>(null)

    // Merge chain data with mocks for UI polish if chain is empty
    const displayVaults = chainVaults.length > 0 ? chainVaults : MOCK_VAULTS

    const handleSort = (k: typeof sortKey) => {
        if (sortKey === k) setSortDir(d => d==='desc'?'asc':'desc')
        else { setSortKey(k); setSortDir('desc') }
    }

    const SortBtn = ({ label, k }: { label: string, k: typeof sortKey }) => (
        <button 
            onClick={() => handleSort(k)} 
            className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#C9A84C] transition-colors font-mono"
        >
            {label}
            {sortKey === k ? (
                sortDir === 'desc' ? <ChevronDown size={12} className="text-[#C9A84C]" /> : <ChevronUp size={12} className="text-[#C9A84C]" />
            ) : (
                <ArrowUpDown size={11} className="text-[#374151]" />
            )}
        </button>
    )

    const rows = displayVaults.filter(v => {
        if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))) return false
        if (activeProtocol && !v.tags?.includes(activeProtocol.toUpperCase())) return false
        if (filter === 'Saved') return v.saved
        if (filter === 'My Positions') return v.deposited > 0
        if (filter === 'Boosted 🔥') return v.boosted
        if (filter === 'Stablecoins') return v.name.includes('USDC') || v.name.includes('USDT')
        if (filter === 'Blue Chips') return v.tier === 'conservative'
        if (filter === 'Single') return v.tags?.length === 1
        return true
    }).sort((a: any, b: any) => {
        const m = sortDir === 'desc' ? -1 : 1
        return m * (a[sortKey] - b[sortKey])
    })

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto space-y-0">
                {/* BLOCK 1 — PLATFORM / PORTFOLIO header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-[#374151] uppercase tracking-wider">Platform</span>
                        <span className="text-[#374151]">/</span>
                        <span className="text-[#6B7280] uppercase tracking-wider">Portfolio</span>
                    </div>
                    <button onClick={() => setHideBalance(!hideBalance)} className="text-[#374151] hover:text-[#6B7280] transition-colors">
                        {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {/* BLOCK 2 — STATS ROW (5 cards) */}
                <div className="grid grid-cols-5 gap-0 mb-6 border border-[#1E1E2E] rounded-xl overflow-hidden shadow-2xl">
                    {PLATFORM_STATS.map((stat, i) => (
                        <motion.div 
                            key={stat.label} 
                            initial={{ opacity: 0, y: 8 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.06 }}
                            className={`px-6 py-5 bg-[#0D0D14] ${i < PLATFORM_STATS.length - 1 ? 'border-r border-[#1E1E2E]' : ''}`}
                        >
                            <div className="font-heading font-black text-2xl text-white mb-1">
                                {hideBalance && i > 0 ? '****' : stat.value}
                                {stat.sub && i === 1 && (
                                    <span className="text-[#10B981] text-sm font-mono font-normal ml-2">{stat.sub}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#374151] uppercase tracking-widest font-mono">{stat.label}</span>
                                {stat.sub && i !== 1 && (
                                    <span className="text-[10px] text-[#6B7280] font-mono">{stat.sub}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* BLOCK 3 — PROTOCOL ICONS ROW */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    {PROTOCOLS.map((p) => (
                        <motion.button
                            key={p.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveProtocol(activeProtocol === p.name ? null : p.name)}
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-150 ${activeProtocol === p.name ? 'border-[#C9A84C] shadow-[0_0_12px_#C9A84C44]' : 'border-[#1E1E2E] hover:border-[#2A2A3E]'} bg-[#111118]`}
                            title={p.name}
                        >
                            {p.emoji}
                        </motion.button>
                    ))}
                </div>

                {/* BLOCK 4 — FILTER PILLS ROW */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {FILTER_PILLS.map((pill) => (
                        <motion.button
                            key={pill}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setFilter(pill)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${filter === pill ? 'bg-[#C9A84C] text-[#0A0A0F] border-[#C9A84C]' : 'bg-[#111118] border border-[#1E1E2E] text-[#6B7280] hover:text-white hover:border-[#2A2A3E]'}`}
                        >
                            {pill}
                        </motion.button>
                    ))}
                    {(filter !== 'All' || search || activeProtocol) && (
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            onClick={() => { setFilter('All'); setSearch(''); setActiveProtocol(null); }}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#2A2A3E] text-[#6B7280] hover:text-white hover:border-[#374151] transition-colors"
                        >
                            Clear All <X size={12} />
                        </motion.button>
                    )}
                </div>

                {/* BLOCK 5 — SEARCH + SORT HEADER */}
                <div className="flex items-center gap-4 mb-0 px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-t-xl border-b-0 shadow-lg">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#374151]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by asset name" className="w-full bg-[#111118] border border-[#1E1E2E] rounded-lg pl-8 pr-4 py-2 text-xs text-white placeholder:text-[#374151] focus:outline-none focus:border-[#C9A84C33] transition-colors" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-[#2A2A3E] text-[10px] text-[#374151] font-mono"> / </div>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-6 pr-2">
                        <SortBtn label="CURRENT APY" k="apy" />
                        <SortBtn label="DAILY" k="daily" />
                        <SortBtn label="TVL" k="tvl" />
                        <SortBtn label="DEPOSITED" k="deposited" />
                    </div>
                </div>

                {/* BLOCK 6 — VAULT ROWS */}
                <div className="border border-[#1E1E2E] rounded-b-xl overflow-hidden shadow-2xl">
                    <AnimatePresence mode="popLayout">
                        {rows.map((vault, i) => {
                            const tier = TIER_CONFIG[vault.tier] || TIER_CONFIG.balanced
                            return (
                                <motion.div
                                    key={vault.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelectedVault(vault)}
                                    className="relative flex items-center gap-6 px-6 py-4 bg-[#0D0D14] hover:bg-[#C9A84C05] border-b border-[#1E1E2E] last:border-0 cursor-pointer transition-all duration-150 group"
                                >
                                    {vault.boosted && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C9A84C]" />}
                                    <div className="flex-shrink-0 w-6 flex items-center">
                                        {vault.boosted && <Star size={14} fill="#C9A84C" className="text-[#C9A84C]" />}
                                        {vault.new && !vault.boosted && <div className="w-2 h-2 rounded-full bg-[#10B981]" />}
                                    </div>
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-[#2A2A3E] group-hover:border-[#C9A84C33] transition-all duration-150" style={{ background: vault.iconBg || '#111118' }}>
                                        {vault.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-heading font-bold text-sm text-white group-hover:text-[#E8D5A3] transition-colors">{vault.name}</span>
                                            {vault.new && <span className="text-[9px] font-bold bg-[#10B981] text-black px-1.5 py-0.5 rounded-full">NEW</span>}
                                            {vault.boosted && <span className="text-[9px] font-bold bg-[#C9A84C15] text-[#C9A84C] border border-[#C9A84C33] px-1.5 py-0.5 rounded-full">BOOSTED</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.border}` }}>{tier.label}</span>
                                            {vault.tags?.map((tag: string) => (
                                                <span key={tag} className="text-[10px] font-mono text-[#6B7280] bg-[#ffffff04] border border-[#1E1E2E] px-2 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-28 text-right">
                                        <div className="font-heading font-black text-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3] bg-clip-text text-transparent">{vault.apy?.toFixed(2)}%</div>
                                    </div>
                                    <div className="w-24 text-right">
                                        <div className="font-mono text-sm text-[#10B981]">{vault.daily?.toFixed(4)}%</div>
                                    </div>
                                    <div className="w-28 text-right">
                                        <div className="font-mono text-sm text-white">{fmtTVL(vault.tvl)}</div>
                                        <div className="font-mono text-[10px] text-[#374151]">{vault.tvlSub}</div>
                                    </div>
                                    <div className="w-20 text-right">
                                        {vault.deposited > 0 ? (
                                            <div className="font-mono text-sm text-[#C9A84C] font-semibold">{hideBalance ? '****' : fmtTVL(vault.deposited)}</div>
                                        ) : (
                                            <div className="font-mono text-sm text-[#2A2A3E]">0</div>
                                        )}
                                    </div>
                                    <button className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#C9A84C15] transition-all duration-150 text-[#6B7280] hover:text-[#C9A84C]">
                                        <Bookmark size={14} fill={vault.saved ? '#C9A84C' : 'none'} className={vault.saved ? 'text-[#C9A84C]' : ''} />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
                {/* Deposit Modal */}
                <DepositModal open={!!selectedVault} onClose={() => setSelectedVault(null)} vault={selectedVault} />
            </div>
        </PageLayout>
    )
}
