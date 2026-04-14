export type SpinReward = {
    label: string
    value: number 
    type: "ARN" | "BONUS_SPIN" | "EMPTY" | "MONEY" | "SURPRISE" | "TRY_AGAIN" | "SERIES_SPIN"
    probability: number
    color: string
    textColor?: string
}