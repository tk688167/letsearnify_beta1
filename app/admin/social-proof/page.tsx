import { getSocialProofStats, getPayoutProofs } from "@/app/actions/admin/social-proof"
import SocialProofClient from "./social-proof-client"

export const dynamic = 'force-dynamic'

export default async function AdminSocialProofPage() {
    const stats = await getSocialProofStats()
    const proofs = await getPayoutProofs()

    return <SocialProofClient initialStats={stats} initialProofs={proofs} />
}
