import db from '@/lib/db';

export const DAILY_FREE_CREDITS = 50;
export const PREMIUM_DAILY_CREDITS = 1000; // Premium users get more credits

export enum CreditAction {
  APP_GENERATION = 'app_generation',
  SANDBOX_PREVIEW = 'sandbox_preview', 
  CODE_EXECUTION = 'code_execution',
}

export const CREDIT_COSTS = {
  [CreditAction.APP_GENERATION]: 5,
  [CreditAction.SANDBOX_PREVIEW]: 2,
  [CreditAction.CODE_EXECUTION]: 1,
};

/**
 * Check if user has enough credits and optionally consume them
 */
export async function checkAndConsumeCredits(
  userId: string, 
  action: CreditAction,
  consume: boolean = true
): Promise<{ success: boolean; remaining: number; message?: string }> {
  try {
    // Get user with current credit status
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { success: false, remaining: 0, message: 'User not found' };
    }

    // Check if credits need to be reset (daily reset)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentCredits = user.credits;
    let needsReset = false;
    
    if (!user.creditsResetAt || user.creditsResetAt < today) {
      // Reset credits for the day
      const dailyCredits = user.isPremuim ? PREMIUM_DAILY_CREDITS : DAILY_FREE_CREDITS;
      currentCredits = dailyCredits;
      needsReset = true;
    }

    const cost = CREDIT_COSTS[action];
    
    if (currentCredits < cost) {
      return {
        success: false,
        remaining: currentCredits,
        message: user.isPremuim 
          ? 'Premium credit limit reached for today' 
          : 'Daily free credit limit reached. Upgrade to premium for more credits!'
      };
    }

    if (consume) {
      const newCredits = currentCredits - cost;
      
      // Update user credits and reset date if needed
      await db.user.update({
        where: { id: userId },
        data: {
          credits: newCredits,
          ...(needsReset && { creditsResetAt: today })
        }
      });

      // Record credit usage
      await db.creditUsage.create({
        data: {
          userId,
          action,
          cost,
          success: true,
          metadata: {
            timestamp: now.toISOString(),
            remainingCredits: newCredits
          }
        }
      });

      return { success: true, remaining: newCredits };
    } else {
      return { success: true, remaining: currentCredits - cost };
    }

  } catch (error) {
    console.error('Credit check error:', error);
    return { success: false, remaining: 0, message: 'Credit system error' };
  }
}

/**
 * Get user's current credit status
 */
export async function getCreditStatus(userId: string): Promise<{
  current: number;
  daily: number;
  isPremuim: boolean;
  resetAt: Date;
  usage: any[];
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      creditUsage: {
        orderBy: { createdAt: 'desc' },
        take: 10 // Last 10 usage records
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if credits need to be reset
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let currentCredits = user.credits;
  let resetAt = user.creditsResetAt || today;
  
  if (!user.creditsResetAt || user.creditsResetAt < today) {
    const dailyCredits = user.isPremuim ? PREMIUM_DAILY_CREDITS : DAILY_FREE_CREDITS;
    currentCredits = dailyCredits;
    resetAt = today;
    
    // Update the user's credits
    await db.user.update({
      where: { id: userId },
      data: {
        credits: currentCredits,
        creditsResetAt: today
      }
    });
  }

  return {
    current: currentCredits,
    daily: user.isPremuim ? PREMIUM_DAILY_CREDITS : DAILY_FREE_CREDITS,
    isPremuim: user.isPremuim,
    resetAt,
    usage: user.creditUsage
  };
}

/**
 * Record failed credit usage (for analytics)
 */
export async function recordFailedUsage(
  userId: string, 
  action: CreditAction,
  error: string
): Promise<void> {
  try {
    await db.creditUsage.create({
      data: {
        userId,
        action,
        cost: 0, // No cost for failed operations
        success: false,
        metadata: {
          error,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    console.error('Failed to record failed usage:', err);
  }
}

/**
 * Upgrade user to premium (to be called after successful Stripe payment)
 */
export async function upgradeToPremium(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      isPremuim: true,
      stripeCustomerId,
      stripeSubscriptionId,
      credits: PREMIUM_DAILY_CREDITS, // Give them premium credits immediately
      creditsResetAt: new Date()
    }
  });
}

/**
 * Cancel premium subscription
 */
export async function cancelPremium(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      isPremuim: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      credits: DAILY_FREE_CREDITS, // Reset to free tier credits
      creditsResetAt: new Date()
    }
  });
}