export const TIER_COMMISSIONS: Record<string, { L1: number, L2: number, L3: number }> = {
    NEWBIE:   { L1: 5,  L2: 3,  L3: 2 },
    BRONZE:   { L1: 9,  L2: 4,  L3: 2 },
    SILVER:   { L1: 12, L2: 5,  L3: 3 },
    GOLD:     { L1: 15, L2: 7,  L3: 3 },
    PLATINUM: { L1: 18, L2: 8,  L3: 4 },
    DIAMOND:  { L1: 22, L2: 9,  L3: 4 },
    EMERALD:  { L1: 25, L2: 10, L3: 5 }
};

export const SIGNUP_BONUS_RATES: Record<string, number> = {
    NEWBIE: 3, BRONZE: 4, SILVER: 5, GOLD: 6,
    PLATINUM: 7, DIAMOND: 8, EMERALD: 10
};

export const DEFAULT_TIER_REQUIREMENTS: Record<string, { arn: number, directs: number }> = {
    NEWBIE:   { arn: 0,      directs: 0 },
    BRONZE:   { arn: 400,    directs: 40 },
    SILVER:   { arn: 1000,   directs: 100 },
    GOLD:     { arn: 1800,   directs: 250 },
    PLATINUM: { arn: 2700,   directs: 500 },
    DIAMOND:  { arn: 7000,   directs: 1200 },
    EMERALD:  { arn: 15000,  directs: 2500 }
};

export const TIER_WITHDRAWAL_LIMITS: Record<string, number> = {
    NEWBIE: 10, BRONZE: 12, SILVER: 15, GOLD: 18,
    PLATINUM: 20, DIAMOND: 25, EMERALD: 30
};

export const TIER_REWARDS: Record<string, { balance: number, arn: number, description: string }> = {
    BRONZE:   { balance: 1.0,   arn: 10,   description: "Bronze Milestone Gift" },
    SILVER:   { balance: 5.0,   arn: 50,   description: "Silver Achievement Reward" },
    GOLD:     { balance: 25.0,  arn: 250,  description: "Gold Status Bonus" },
    PLATINUM: { balance: 100.0, arn: 1000, description: "Platinum Excellence Reward" },
    DIAMOND:  { balance: 500.0, arn: 5000, description: "Diamond Elite Gift" },
    EMERALD:  { balance: 1000.0,arn: 10000,description: "Emerald Ultimate Achievement Reward" }
};

export const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];
