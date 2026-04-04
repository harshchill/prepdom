export const PLAN_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
  PREMIUM_PLUS: "premium_plus",
};

export const PLAN_DEFINITIONS = [
  {
    id: PLAN_TIERS.FREE,
    name: "Free Tier",
    priceInr: 0,
    cadenceLabel: "Forever",
    description: "For students getting started.",
    features: [
      "Browse paper library",
      "Save papers",
      "Upload and earn coins",
      "Basic dashboard access",
    ],
  },
  {
    id: PLAN_TIERS.PREMIUM,
    name: "Premium",
    priceInr: 79,
    cadenceLabel: "Monthly",
    description: "Core premium tools for focused preparation.",
    features: [
      "AI Tutor access",
      "Mock paper generator",
      "Premium study tools",
      "Everything in Free",
    ],
  },
  {
    id: PLAN_TIERS.PREMIUM_PLUS,
    name: "Premium Plus",
    priceInr: 99,
    cadenceLabel: "Monthly",
    description: "Everything in Premium plus unlimited paper access.",
    features: [
      "Everything in Premium",
      "All papers free to access",
      "Priority access experience",
    ],
  },
];

const VALID_TIERS = new Set(Object.values(PLAN_TIERS));

export function normalizePlanTier(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return VALID_TIERS.has(normalized) ? normalized : null;
}

export function resolvePlanTierFromUser(userLike) {
  const normalized = normalizePlanTier(userLike?.planTier);

  if (normalized) {
    return normalized;
  }

  return userLike?.isPremium ? PLAN_TIERS.PREMIUM : PLAN_TIERS.FREE;
}

export function isPaidTier(planTier) {
  const tier = normalizePlanTier(planTier);
  return tier === PLAN_TIERS.PREMIUM || tier === PLAN_TIERS.PREMIUM_PLUS;
}

export function canAccessAiTutor(planTier) {
  return isPaidTier(planTier);
}

export function canAccessMockPaper(planTier) {
  return isPaidTier(planTier);
}

export function hasAllPapersFreeAccess(planTier) {
  return normalizePlanTier(planTier) === PLAN_TIERS.PREMIUM_PLUS;
}

export function getPlanLabel(planTier) {
  const tier = normalizePlanTier(planTier);

  if (tier === PLAN_TIERS.PREMIUM) {
    return "Premium";
  }

  if (tier === PLAN_TIERS.PREMIUM_PLUS) {
    return "Premium Plus";
  }

  return "Free";
}
