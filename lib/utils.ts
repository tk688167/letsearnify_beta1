import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ARN_EXCHANGE_RATE = 10;


export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatUserId(memberId: string | number | undefined | null) {
  if (memberId === undefined || memberId === null) return "LEU-XXXXXX";
  return `LEU-${memberId.toString().padStart(6, '0')}`;
}

export const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

/**
 * Highly defensive utility to calculate progress toward the next rank.
 * Handles both transformed and raw DB tier rules (arn/requiredArn, directs/members).
 */
export function calculateTierProgress(
  currentTier: string,
  points: number,
  activeMembers: number,
  tierRules: any // Accept any to handle various object structures
) {
  // 1. Normalize Casing
  const normalizedTier = (currentTier || "NEWBIE").toUpperCase().trim();
  const currentIndex = TIER_ORDER.indexOf(normalizedTier);
  const nextTier = TIER_ORDER[currentIndex + 1];

  if (!nextTier) {
    return { progress: 100, nextTier: "MAX" };
  }

  // 2. Normalize Rules (Handle both raw DB and transformed formats)
  const normalizedRules: Record<string, { arn: number, directs: number }> = {};
  
  // Use hardcoded defaults as a base, then overlay provided rules
  const DEFAULTS: Record<string, { arn: number, directs: number }> = {
    NEWBIE:   { arn: 0,      directs: 0 },
    BRONZE:   { arn: 400,    directs: 40 },
    SILVER:   { arn: 1000,   directs: 100 },
    GOLD:     { arn: 1800,   directs: 250 },
    PLATINUM: { arn: 1500,   directs: 500 },
    DIAMOND:  { arn: 7000,   directs: 1200 },
    EMERALD:  { arn: 15000,  directs: 250 }
  };

  Object.keys(DEFAULTS).forEach((tier: any) => {
    normalizedRules[tier] = DEFAULTS[tier];
  });

  // Overlay provided rules with property-agnostic mapping
  Object.keys(tierRules || {}).forEach((k: any) => {
    const rawRule = tierRules[k];
    if (rawRule && typeof rawRule === 'object') {
      normalizedRules[k.toUpperCase().trim()] = {
        arn: Number(rawRule.arn ?? rawRule.requiredArn ?? 0) || 0,
        directs: Number(rawRule.directs ?? rawRule.members ?? 0) || 0
      };
    }
  });

  // 3. Extract Tier Configs
  const nextConfig = normalizedRules[nextTier.toUpperCase()];
  const currentConfig = normalizedRules[normalizedTier] || { arn: 0, directs: 0 };
  
  // Hard Baseline Defense: If NEWBIE, start from zero regardless of DB rules
  const baselinePoints = normalizedTier === "NEWBIE" ? 0 : currentConfig.arn;
  const baselineMembers = normalizedTier === "NEWBIE" ? 0 : currentConfig.directs;

  // 4. Force numeric inputs
  const p = Number(points) || 0;
  const m = Number(activeMembers) || 0;

  const targetPoints = nextConfig.arn;
  const targetMembers = nextConfig.directs;

  // 5. Delta Calculation (Progress starting from previous tier baseline)
  const displayPoints = Math.max(0, p - baselinePoints);
  const displayTargetPoints = Math.max(1, targetPoints - baselinePoints); // Min 1 to prevent division by zero
  
  const displayMembers = Math.max(0, m - baselineMembers);
  const displayTargetMembers = Math.max(1, targetMembers - baselineMembers);

  const pointCompletion = Math.min(displayPoints / displayTargetPoints, 1);
  const memberCompletion = Math.min(displayMembers / displayTargetMembers, 1);
  
  // Overall progress is the average of both tracks (Points and Network)
  const totalProgress = (pointCompletion + memberCompletion) / 2;

  return {
    progress: Math.round(totalProgress * 100),
    nextTier,
    isPointsComplete: pointCompletion >= 1,
    isMembersComplete: memberCompletion >= 1,
    pointCompletion: Math.round(pointCompletion * 100),
    memberCompletion: Math.round(memberCompletion * 100)
  };
}
