export type SpinReward = {
    label: string
    value: number 
    type: "ARN" | "BONUS_SPIN" | "EMPTY" | "MONEY" | "SURPRISE" | "TRY_AGAIN"
    probability: number
    color: string
    textColor?: string
}

// Free Spin Rewards (10 segments: 4 Try Again + 6 varied rewards)
// Admin can fully override these via /admin/spin
// Free Spin Rewards (10 segments — Try Agains spread evenly)
export const FREE_REWARDS: SpinReward[] = [
    { label: "5 ARN",      value: 5,  type: "ARN",        probability: 0.10, color: "#e0e7ff", textColor: "#4338ca" },
    { label: "1 ARN",      value: 1,  type: "ARN",        probability: 0.15, color: "#f0f9ff", textColor: "#0369a1" },
    { label: "Try Again",  value: 0,  type: "TRY_AGAIN",  probability: 0.13, color: "#f3f4f6", textColor: "#6b7280" },
    { label: "7 ARN",      value: 7,  type: "ARN",        probability: 0.07, color: "#c7d2fe", textColor: "#3730a3" },
    { label: "Surprise!",  value: 0,  type: "SURPRISE",   probability: 0.02, color: "#fce7f3", textColor: "#db2777" },
    { label: "Try Again",  value: 0,  type: "TRY_AGAIN",  probability: 0.13, color: "#e5e7eb", textColor: "#6b7280" },
    { label: "3 ARN",      value: 3,  type: "ARN",        probability: 0.12, color: "#eef2ff", textColor: "#4f46e5" },
    { label: "10 ARN",     value: 10, type: "ARN",        probability: 0.04, color: "#a5b4fc", textColor: "#312e81" },
    { label: "Try Again",  value: 0,  type: "TRY_AGAIN",  probability: 0.12, color: "#f9fafb", textColor: "#9ca3af" },
    { label: "Try Again",  value: 0,  type: "TRY_AGAIN",  probability: 0.12, color: "#d1d5db", textColor: "#9ca3af" },
]

// Premium Spin Rewards (10 segments — Try Agains spread evenly)
export const PREMIUM_REWARDS: SpinReward[] = [
    { label: "20 ARN",     value: 20,   type: "ARN",        probability: 0.12, color: "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)", textColor: "#78350f" },
    { label: "10 ARN",     value: 10,   type: "ARN",        probability: 0.15, color: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)", textColor: "#92400e" },
    { label: "Try Again",  value: 0,    type: "TRY_AGAIN",  probability: 0.16, color: "#374151", textColor: "#9ca3af" },
    { label: "50 ARN",     value: 50,   type: "ARN",        probability: 0.08, color: "linear-gradient(135deg, #FDB931 0%, #FFD700 100%)", textColor: "#78350f" },
    { label: "+3 Spins",   value: 3,    type: "BONUS_SPIN", probability: 0.06, color: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)", textColor: "#064e3b" },
    { label: "Try Again",  value: 0,    type: "TRY_AGAIN",  probability: 0.16, color: "#1f2937", textColor: "#6b7280" },
    { label: "100 ARN",    value: 100,  type: "ARN",        probability: 0.04, color: "linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)", textColor: "#1e3a8a" },
    { label: "$0.10",      value: 0.10, type: "MONEY",      probability: 0.05, color: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)", textColor: "#7f1d1d" },
    { label: "Try Again",  value: 0,    type: "TRY_AGAIN",  probability: 0.15, color: "#111827", textColor: "#6b7280" },
    { label: "Mega Gift",  value: 0,    type: "SURPRISE",   probability: 0.03, color: "linear-gradient(135deg, #d8b4fe 0%, #a855f7 100%)", textColor: "#581c87" },
]