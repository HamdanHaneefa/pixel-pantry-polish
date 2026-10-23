export interface CartMilestone {
  threshold: number;
  label: string;
  sublabel: string;
  discount: number;
  isFreeShipping: boolean;
}

export const CART_MILESTONES: CartMilestone[] = [
  { threshold: 750, label: "Delivery Free", sublabel: "₹750", discount: 0, isFreeShipping: true },
  { threshold: 2000, label: "Save ₹50", sublabel: "₹2000", discount: 50, isFreeShipping: true },
  { threshold: 3000, label: "Save ₹75", sublabel: "₹3000", discount: 75, isFreeShipping: true },
  { threshold: 5000, label: "Save ₹150", sublabel: "₹5000", discount: 150, isFreeShipping: true },
];

export interface MilestoneProgress {
  progressPercent: number;
  tierDiscount: number;
  isFreeShipping: boolean;
  activeMilestoneIndex: number;
  nextMilestone: CartMilestone | null;
  amountNeededForNext: number;
  headlineMessage: string;
}

export function calculateMilestoneProgress(subtotal: number): MilestoneProgress {
  const milestones = CART_MILESTONES;
  let tierDiscount = 0;
  let isFreeShipping = false;
  let activeMilestoneIndex = -1;

  for (let i = 0; i < milestones.length; i++) {
    if (subtotal >= milestones[i]!.threshold) {
      activeMilestoneIndex = i;
      tierDiscount = milestones[i]!.discount;
      if (milestones[i]!.isFreeShipping) {
        isFreeShipping = true;
      }
    }
  }

  const nextMilestone =
    activeMilestoneIndex < milestones.length - 1
      ? milestones[activeMilestoneIndex + 1]!
      : null;

  const amountNeededForNext = nextMilestone ? Math.max(0, nextMilestone.threshold - subtotal) : 0;

  // Calculate visual progress bar percentage across the 4 nodes
  // Node 0: ~12% at 750
  // Node 1: ~38% at 2000
  // Node 2: ~63% at 3000
  // Node 3: ~88% at 5000
  // To line up with 4 evenly spaced flex nodes (12.5%, 37.5%, 62.5%, 87.5% centers):
  let progressPercent = 0;
  if (subtotal <= 0) {
    progressPercent = 0;
  } else if (subtotal < milestones[0]!.threshold) {
    progressPercent = (subtotal / milestones[0]!.threshold) * 12.5;
  } else if (subtotal < milestones[1]!.threshold) {
    const range = milestones[1]!.threshold - milestones[0]!.threshold;
    const current = subtotal - milestones[0]!.threshold;
    progressPercent = 12.5 + (current / range) * 25;
  } else if (subtotal < milestones[2]!.threshold) {
    const range = milestones[2]!.threshold - milestones[1]!.threshold;
    const current = subtotal - milestones[1]!.threshold;
    progressPercent = 37.5 + (current / range) * 25;
  } else if (subtotal < milestones[3]!.threshold) {
    const range = milestones[3]!.threshold - milestones[2]!.threshold;
    const current = subtotal - milestones[2]!.threshold;
    progressPercent = 62.5 + (current / range) * 25;
  } else {
    progressPercent = 100;
  }

  // Headline Teaser
  let headlineMessage = "";
  if (!nextMilestone) {
    headlineMessage = "🎉 You've unlocked maximum savings: Free Delivery + ₹150 OFF!";
  } else if (nextMilestone.threshold === 750) {
    headlineMessage = `Add ₹${amountNeededForNext.toLocaleString("en-IN")} more to get Free Delivery`;
  } else {
    headlineMessage = `Add ₹${amountNeededForNext.toLocaleString("en-IN")} more to save ${nextMilestone.label} Extra`;
  }

  return {
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    tierDiscount,
    isFreeShipping,
    activeMilestoneIndex,
    nextMilestone,
    amountNeededForNext,
    headlineMessage,
  };
}
