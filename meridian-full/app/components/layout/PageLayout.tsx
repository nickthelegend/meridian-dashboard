'use client'
import { TopNav } from './TopNav'
import { motion } from 'framer-motion'

export function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#05070A] text-white">
            <TopNav />
            {/* Background ambient effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#1A1A2E]/40 rounded-full blur-[100px]" />
                {/* Subtle grid */}
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                        backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`, 
                        backgroundSize: '64px 64px' 
                    }} 
                />
            </div>
            <main className="relative pt-24 px-6 pb-12 max-w-7xl mx-auto z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 12 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}
