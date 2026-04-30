export type SpinReward = {
    id?: string
    label: string
    value: number 
    type: "ARN" | "BONUS_SPIN" | "EMPTY" | "MONEY" | "SURPRISE" | "TRY_AGAIN" | "SERIES_SPIN"
    probability: number
    color: string
    textColor?: string
}

export const getStandardSegments = (dbRewards: any[], type: "FREE" | "PREMIUM") => {
    // Requirements: ARN 1-5, 3 Trigon, 1 Surprise, 1 Another Spin
    const structure = [
        { label: "ARN 1", value: 1, type: "ARN", probability: 0.10 },
        { label: "ARN 2", value: 2, type: "ARN", probability: 0.08 },
        { label: "ARN 3", value: 3, type: "ARN", probability: 0.06 },
        { label: "ARN 4", value: 4, type: "ARN", probability: 0.04 },
        { label: "ARN 5", value: 5, type: "ARN", probability: 0.02 },
        { label: "Trigon", value: 0, type: "EMPTY", probability: 0.15 },
        { label: "Trigon", value: 0, type: "EMPTY", probability: 0.15 },
        { label: "Trigon", value: 0, type: "EMPTY", probability: 0.15 },
        { label: "Surprise", value: 0, type: "SURPRISE", probability: 0.02 },
        { label: "Spin Again", value: 1, type: "BONUS_SPIN", probability: 0.05 },
    ];

    // 1. Start with any rewards that exist in the database
    const finalSegments = dbRewards.map((r: any) => ({
        ...r,
        type: r.type as SpinReward["type"],
        textColor: r.textColor || undefined
    }));

    // 2. If we have fewer than 10 segments, pad with defaults from the structure
    // This ensures the 10-segment architecture is always maintained visually.
    if (finalSegments.length < 10) {
        const remainingCount = 10 - finalSegments.length;
        
        // Take the last N items from the default structure to avoid overriding the first items if admin added some
        const defaultsToAppend = structure.slice(10 - remainingCount).map((s, i) => {
            const index = finalSegments.length + i;
            return {
                id: `default-${type}-${index}`,
                ...s,
                type: s.type as SpinReward["type"],
                color: type === "PREMIUM" 
                    ? (index % 2 === 0 ? "#1e293b" : "#0f172a") 
                    : (index % 2 === 0 ? "#312e81" : "#1e1b4b"),
                textColor: type === "PREMIUM" ? "#fcd34d" : "#c7d2fe",
                isEnabled: true,
                spinType: type,
                order: index
            };
        });

        return [...finalSegments, ...defaultsToAppend];
    }

    return finalSegments;
};