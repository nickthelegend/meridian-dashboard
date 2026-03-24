'use client'
import { PageLayout } from '@/app/components/layout/PageLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Search, Star, SlidersHorizontal, ChevronDown, ChevronUp, ArrowUpDown, Bookmark, X, Eye, EyeOff, Target, Shield, Zap, TrendingUp, Coins, Briefcase } from 'lucide-react'

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

const VAULTS = [
    {
        id: 'usdc-kamino',
        name: 'USDC-KAMINO',
        platform: 'Kamino Finance',
        icon: '🛡️',
        iconBg: '#0D1117',
        tier: 'conservative',
        apy: 7.24,
        dailyApy: 0.0198,
        tvl: 4200000,
        tvlStr: '$4.2M',
        deposited: 250000,
        new: false,
        boosted: false,
        saved: false,
        tags: ['USDC', 'KAMINO']
    },
    {
        id: 'usdc-multi',
        name: 'USDC-MULTI',
        platform: 'Kamino + Marginfi + Drift',
        icon: '🏦',
        iconBg: '#1A1A3A',
        tier: 'balanced',
        apy: 9.41,
        dailyApy: 0.0258,
        tvl: 8750000,
        tvlStr: '$8.75M',
        deposited: 0,
        new: true,
        boosted: true,
        saved: false,
        tags: ['USDC', 'MULTI-PROTOCOL']
    },
    {
        id: 'usdc-alpha',
        name: 'USDC-ALPHA',
        platform: 'Drift Vaults',
        icon: '⚡️',
        iconBg: '#2A1A1A',
        tier: 'aggressive',
        apy: 14.10,
        dailyApy: 0.0387,
        tvl: 2100000,
        tvlStr: '$2.1M',
        deposited: 0,
        new: true,
        boosted: true,
        saved: true,
        tags: ['USDC', 'DRIFT']
    },
    {
        id: 'usdy-ondo',
        name: 'USDY-TBILL',
        platform: 'Ondo Finance RWA',
        icon: '🏛',
        iconBg: '#1A1A2E',
        tier: 'conservative',
        apy: 5.20,
        dailyApy: 0.0142,
        tvl: 12000000,
        tvlStr: '$12M',
        deposited: 0,
        new: false,
        boosted: false,
        saved: true,
        tags: ['RWA', 'ONDO', 'T-BILL']
    },
    {
        id: 'usdt-marginfi',
        name: 'USDT-STABLE',
        platform: 'Marginfi Lending',
        icon: '💎',
        iconBg: '#1E1A2E',
        tier: 'balanced',
        apy: 8.65,
        dailyApy: 0.0237,
        tvl: 3400000,
        tvlStr: '$3.4M',
        deposited: 0,
        new: false,
        boosted: false,
        saved: false,
        tags: ['USDT', 'MARGINFI']
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
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [sortKey, setSortKey] = useState<'apy'|'dailyApy'|'tvl'|'deposited'>('tvl')
    const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
    const [hideBalance, setHideBalance] = useState(false)
    const [activeProtocol, setActiveProtocol] = useState<string|null>(null)

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

    const rows = VAULTS.filter(v => {
        if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
        if (activeProtocol && !v.tags.includes(activeProtocol.toUpperCase())) return false
        if (filter === 'Saved') return v.saved
        if (filter === 'My Positions') return v.deposited > 0
        if (filter === 'Boosted 🔥') return v.boosted
        if (filter === 'Stablecoins') return v.name.includes('USDC') || v.name.includes('USDT')
        if (filter === 'Blue Chips') return v.tier === 'conservative'
        if (filter === 'Single') return v.tags.length === 1
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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-0 mb-6 border border-[#1E1E2E] rounded-xl overflow-hidden">
                    {PLATFORM_STATS.map((stat, i) => (
                        <motion.div 
                            key={stat.label} 
                            initial={{ opacity: 0, y: 8 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.06 }}
                            className={`px-6 py-5 bg-[#0D0D14] ${i < PLATFORM_STATS.length - 1 ? 'lg:border-r border-b lg:border-b-0 border-[#1E1E2E]' : ''}`}
                        >
                            <div className="font-heading font-black text-2xl text-white mb-1 tracking-tighter">
                                {hideBalance && i > 0 ? '****' : stat.value}
                                {stat.sub && i === 1 && (
                                    <span className="text-[#10B981] text-xs font-mono font-normal ml-2">{stat.sub}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#374151] uppercase tracking-widest font-mono font-bold">{stat.label}</span>
                                {stat.sub && i !== 1 && (
                                    <span className="text-[9px] text-[#6B7280] font-mono">{stat.sub}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* BLOCK 3 — PROTOCOL ICONS ROW */}
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
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
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {FILTER_PILLS.map((pill) => (
                        <motion.button
                            key={pill}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setFilter(pill)}
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all duration-150 border ${filter === pill ? 'bg-[#D4AF37] text-[#0A0A0F] border-[#D4AF37]' : 'bg-[#111118] border border-[#1E1E2E] text-[#6B7280] hover:text-white'}`}
                        >
                            {pill}
                        </motion.button>
                    ))}
                    {(filter !== 'All' || search || activeProtocol) && (
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            onClick={() => { setFilter('All'); setSearch(''); setActiveProtocol(null); }}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#EF444433] text-[#EF4444] hover:bg-[#EF444411] transition-colors"
                        >
                            Clear All <X size={12} />
                        </motion.button>
                    )}
                </div>

                {/* BLOCK 5 — SEARCH + SORT HEADER */}
                <div className="flex items-center gap-4 mb-0 px-6 py-4 bg-[#0A0A0F] border border-[#1E1E2E] rounded-t-2xl border-b-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#374151]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by asset name" className="w-full bg-[#111118] border border-[#1E1E2E] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-[#374151] focus:outline-none focus:border-[#D4AF3733] transition-colors" />
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-8 pr-2">
                        <SortBtn label="APY" k="apy" />
                        <SortBtn label="DAILY" k="dailyApy" />
                        <SortBtn label="TVL" k="tvl" />
                        <SortBtn label="DEPOSITED" k="deposited" />
                    </div>
                </div>

                {/* BLOCK 6 — VAULT ROWS */}
                <div className="border border-[#1E1E2E] rounded-b-2xl overflow-hidden shadow-2xl">
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
                                    className="relative flex items-center gap-8 px-8 py-5 bg-[#0D0D14] hover:bg-[#D4AF37]/[0.02] border-b border-[#1E1E2E] last:border-0 cursor-pointer transition-all duration-150 group"
                                >
                                    {vault.boosted && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#D4AF37]" />}
                                    
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-3xl border border-[#2A2A3E] group-hover:border-[#D4AF3733] transition-all duration-300 relative" style={{ background: vault.iconBg }}>
                                        {vault.icon}
                                        {vault.boosted && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] border-2 border-[#0A0A0F] flex items-center justify-center shadow-lg">
                                                <Star size={10} className="text-[#0A0A0F]" fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-heading font-black text-sm text-white group-hover:text-[#D4AF37] transition-colors tracking-wide uppercase">{vault.name}</span>
                                            {vault.new && <span className="text-[9px] font-black bg-[#10B981] text-[#0A0A0F] px-1.5 py-0.5 rounded">NEW</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-tighter" style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}>{tier.label}</span>
                                            {vault.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-mono text-[#6B7280] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-28 text-right">
                                        <div className="font-heading font-black text-xl bg-gradient-to-r from-[#D4AF37] to-[#F0F6FC] bg-clip-text text-transparent">{vault.apy.toFixed(2)}%</div>
                                    </div>

                                    <div className="w-24 text-right">
                                        <div className="font-mono text-sm text-[#10B981] font-bold">{vault.daily.toFixed(4)}%</div>
                                    </div>

                                    <div className="w-28 text-right">
                                        <div className="font-mono text-sm text-white font-medium tracking-tight">{vault.tvlSub}</div>
                                        <div className="font-mono text-[9px] text-[#374151] uppercase tracking-widest mt-0.5">Liquidity</div>
                                    </div>

                                    <div className="w-24 text-right">
                                        {vault.deposited > 0 ? (
                                            <div className="font-mono text-sm text-[#D4AF37] font-black">{hideBalance ? '****' : fmtTVL(vault.deposited)}</div>
                                        ) : (
                                            <div className="font-mono text-sm text-[#2A2A3E]">——</div>
                                        )}
                                    </div>

                                    <button className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#D4AF3715] transition-all duration-200 text-[#6B7280] hover:text-[#D4AF37]">
                                        <Bookmark size={16} fill={vault.saved ? '#D4AF37' : 'none'} className={vault.saved ? 'text-[#D4AF37]' : ''} />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    {rows.length === 0 && <div className="py-24 text-center text-[#374151] text-xs font-mono uppercase tracking-[0.2em]">No matching vaults found in epoch</div>}
                </div>

                <div className="flex items-center justify-between pt-4 px-1">
                    <span className="text-[10px] text-[#374151] font-mono uppercase tracking-widest font-bold">{rows.length} of {VAULTS.length} active vaults</span>
                    <span className="text-[10px] text-[#374151] font-mono uppercase tracking-widest">Calculated across Kamino, Marginfi & Drift</span>
                </div>
            </div>
        </PageLayout>
    )
}
