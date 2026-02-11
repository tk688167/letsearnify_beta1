import { getSocialProofStats, getPayoutProofs, getRecentActivity, getAnalyticsHistory } from "@/app/actions/admin/social-proof"
import SocialProofClient from "./social-proof-client"

export const dynamic = 'force-dynamic'

export default async function AdminSocialProofPage() {
    const stats = await getSocialProofStats()
    const proofs = await getPayoutProofs()
    const activity = await getRecentActivity()
    const history = await getAnalyticsHistory()

    return <SocialProofClient initialStats={stats} initialProofs={proofs} activityLogs={activity} historyData={history} />
}
