import { PageLayout } from '@/components/layout/PageLayout'

export default function SettingsPage() {
    return (
        <PageLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold font-heading">Settings</h1>
                <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-[#8B949E]">
                    Multi-Sig and Whitelist Configuration Staging
                </div>
            </div>
        </PageLayout>
    )
}
