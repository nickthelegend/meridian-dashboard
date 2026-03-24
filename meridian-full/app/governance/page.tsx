'use client'
import { PageLayout } from '@/components/layout/PageLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Vote, Plus, Clock, CheckCircle2, XCircle, Coins, Zap, ChevronRight, BarChart3 } from 'lucide-react'

const proposals = [
    {
        id: 'MIP-15',
        title: 'Add Ondo USDY as Accepted Collateral',
        description: 'Whitelist Ondo Finance USDY token as valid RWA collateral for institutional credit lines. Enables T-Bill backed borrowing.',
        status: 'active',
        timeLeft: '4d 2h remaining',
        votesFor: 78,
        votesAgainst: 22,
        myVote: null,
        quorum: 65,
    },
    {
        id: 'MIP-14',
        title: 'Update Yield Parameters for SOL Vault',
        description: 'Adjustment of performance fees from 10% to 8.5% to increase depositor yield across all conservative-tier vaults.',
        status: 'active',
        timeLeft: '2d 14h remaining',
        votesFor: 72,
        votesAgainst: 28,
        myVote: null,
        quorum: 65,
    },
    {
        id: 'MIP-13',
        title: 'Integrate JitoSOL Staking',
        description: 'Whitelist JitoSOL as a valid collateral asset for institutional credit lines across balanced and aggressive tiers.',
        status: 'passed',
        timeLeft: 'Executed 5 days ago',
        votesFor: 94,
        votesAgainst: 6,
        myVote: 'for',
        quorum: 65,
    },
    {
        id: 'MIP-12',
        title: 'Reduce Conservative Vault Min Deposit',
        description: 'Lower minimum deposit threshold from $100,000 to $50,000 to expand institutional access.',
        status: 'failed',
        timeLeft: 'Closed 12 days ago',
        votesFor: 41,
        votesAgainst: 59,
        myVote: 'against',
        quorum: 65,
    },
]

const statusConfig: Record<string, any> = {
    active: {
        label: 'ACTIVE',
        color: '#10B981',
        bg: '#10B98115',
        border: '#10B98133',
        icon: Zap,
    },
    passed: {
        label: 'PASSED',
        color: '#C9A84C',
        bg: '#C9A84C15',
        border: '#C9A84C33',
        icon: CheckCircle2,
    },
    failed: {
        label: 'FAILED',
        color: '#EF4444',
        bg: '#EF444415',
        border: '#EF444433',
        icon: XCircle,
    },
}

export default function GovernancePage() {
    const [votes, setVotes] = useState<Record<string, 'for' | 'against'>>({})

    const handleVote = (id: string, direction: 'for' | 'against') => {
        setVotes(prev => ({ ...prev, [id]: direction }))
    }

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-start justify-between pt-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Vote size={20} className="text-[#C9A84C]" />
                            <span className="text-xs font-mono text-[#6B7280] uppercase tracking-widest">
                                On-Chain Governance
                            </span>
                        </div>
                        <h1 className="font-heading text-4xl font-bold text-white mb-2">
                            Governance
                        </h1>
                        <p className="text-[#6B7280]">
                            Shape the future of MERIDIAN protocol.
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 24px #C9A84C44' }} 
                        whileTap={{ scale: 0.98 }} 
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A07830] text-[#0A0A0F] font-semibold text-sm font-heading transition-all duration-200"
                    >
                        <Plus size={16} />
                        Create Proposal
                    </motion.button>
                </div>

                {/* Voting Power Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Your Balance', value: '24,500 MRDN', icon: Coins, sub: '≈ $2,450 USD' },
                        { label: 'Delegated Power', value: '1.2M MRDN', icon: Zap, sub: 'From 3 delegators' },
                        { label: 'Proposals Voted', value: '8 / 14', icon: Vote, sub: '57% participation' },
                    ].map((item, i) => (
                        <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative p-5 rounded-2xl overflow-hidden bg-gradient-to-br from-[#111118] to-[#1A1A2E] border border-[#2A2A3E] hover:border-[#C9A84C33] transition-all duration-200"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C08] rounded-full blur-2xl" />
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-2">{item.label}</div>
                                    <div className="font-heading font-bold text-xl text-white mb-1">
                                        {item.value}
                                    </div>
                                    <div className="text-xs text-[#6B7280]">{item.sub}</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-[#C9A84C15] border border-[#C9A84C33] flex items-center justify-center">
                                    <item.icon size={18} className="text-[#C9A84C]" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2">
                    {['All', 'Active', 'Passed', 'Failed'].map((tab) => (
                        <button 
                            key={tab}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#111118] border border-[#2A2A3E] text-[#6B7280] hover:text-white hover:border-[#C9A84C44] transition-all duration-150 first:bg-[#C9A84C15] first:border-[#C9A84C44] first:text-[#C9A84C]"
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Proposals List */}
                <div className="space-y-4">
                    {proposals.map((proposal, i) => {
                        const config = statusConfig[proposal.status as keyof typeof statusConfig]
                        const myVote = votes[proposal.id] || proposal.myVote
                        const isActive = proposal.status === 'active'
                        
                        return (
                            <motion.div 
                                key={proposal.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.08 }}
                                className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-[#111118] to-[#1A1A2E] border border-[#2A2A3E] hover:border-[#C9A84C22] transition-all duration-200 group"
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono"
                                            style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
                                        >
                                            <config.icon size={11} />
                                            {config.label}
                                        </div>
                                        <span className="text-xs font-mono text-[#6B7280]">
                                            {proposal.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                                        <Clock size={12} />
                                        {proposal.timeLeft}
                                    </div>
                                </div>

                                {/* Title + Description */}
                                <h3 className="font-heading font-semibold text-lg text-white mb-2 group-hover:text-[#E8D5A3] transition-colors duration-200">
                                    {proposal.title}
                                </h3>
                                <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
                                    {proposal.description}
                                </p>

                                {/* Vote bars */}
                                <div className="space-y-2 mb-5">
                                    {/* For bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[#10B981] w-20 font-mono">
                                            For {proposal.votesFor}%
                                        </span>
                                        <div className="flex-1 h-1.5 bg-[#ffffff08] rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${proposal.votesFor}%` }}
                                                transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full" 
                                            />
                                        </div>
                                    </div>
                                    {/* Against bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[#EF4444] w-20 font-mono">
                                            Against {proposal.votesAgainst}%
                                        </span>
                                        <div className="flex-1 h-1.5 bg-[#ffffff08] rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${proposal.votesAgainst}%` }}
                                                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-full" 
                                            />
                                        </div>
                                    </div>
                                    {/* Quorum indicator */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="flex-1 h-px bg-[#ffffff05]" />
                                        <span className="text-xs text-[#374151] font-mono">
                                            Quorum: {proposal.quorum}% required
                                        </span>
                                        <div className="flex-1 h-px bg-[#ffffff05]" />
                                    </div>
                                </div>

                                {/* Bottom row — vote status + actions */}
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-mono">
                                        {myVote ? (
                                            <span className={myVote === 'for' ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                                                Your Vote: {myVote === 'for' ? '✓ For' : '✗ Against'}
                                            </span>
                                        ) : (
                                            <span className="text-[#374151]">
                                                Your Vote: Not Voted
                                            </span>
                                        )}
                                    </div>

                                    {isActive && !myVote && (
                                        <div className="flex items-center gap-2">
                                            <motion.button 
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleVote(proposal.id, 'for')}
                                                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#10B98115] border border-[#10B98144] text-[#10B981] hover:bg-[#10B98125] transition-all duration-150"
                                            >
                                                Vote For
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleVote(proposal.id, 'against')}
                                                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#EF444415] border border-[#EF444444] text-[#EF4444] hover:bg-[#EF444425] transition-all duration-150"
                                            >
                                                Vote Against
                                            </motion.button>
                                        </div>
                                    )}

                                    {(!isActive || myVote) && (
                                        <button className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#C9A84C] transition-colors duration-150">
                                            View Details <ChevronRight size={12} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </PageLayout>
    )
}
