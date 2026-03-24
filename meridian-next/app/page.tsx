import { TopNav } from '@/components/layout/TopNav'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            <TopNav />
            
            <main className="relative pt-32 px-6 max-w-7xl mx-auto overflow-hidden">
                {/* Background ambient effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF3708] rounded-full blur-[120px]" />
                
                <section className="text-center space-y-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-6xl md:text-7xl font-bold font-heading leading-tight">
                            Institutional Yield, <br/>
                            <span className="bg-gradient-to-r from-[#D4AF37] to-[#A07830] bg-clip-text text-transparent">Secured.</span>
                        </h1>
                        <p className="mt-6 text-[#8B949E] text-xl max-w-2xl mx-auto leading-relaxed">
                            A high-fidelity institutional liquid staking and yield aggregation protocol powered by Solana.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4 pt-4"
                    >
                        <Link href="/dashboard">
                            <button className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#C5A028] transition-all transform hover:scale-105 shadow-2xl">
                                Launch Dashboard
                            </button>
                        </Link>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                            Documentation
                        </button>
                    </motion.div>
                </section>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'M-of-N Governance', desc: 'Institutional control via multi-sig transaction approval flows.' },
                        { title: 'Risk Management', desc: 'Curated risk tiers across Kamino, Marginfi, and Drift.' },
                        { title: 'Capital Efficiency', desc: 'Optimized delta-neutral strategies for stable yields.' }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#D4AF3722] transition-all"
                        >
                            <h3 className="text-lg font-bold font-heading mb-3">{feature.title}</h3>
                            <p className="text-[#8B949E] text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    )
}
