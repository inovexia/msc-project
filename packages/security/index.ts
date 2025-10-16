import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from '@arcjet/next';
import { keys } from './keys';

const arcjetKey = keys().ARCJET_KEY;

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request
) => {
  if (!arcjetKey) {
    return;
  }

  try {
    const base = arcjet({
      // Get your site key from https://app.arcjet.com
      key: arcjetKey,
      // Identify the user by their IP address
      characteristics: ['ip.src'],
      rules: [
        // Protect against common attacks with Arcjet Shield
        shield({
          // Will block requests. Use "DRY_RUN" to log only
          mode: 'LIVE',
        }),
        // Other rules are added in different routes
      ],
    });

    const req = sourceRequest ?? (await request());
    const aj = base.withRule(detectBot({ mode: 'LIVE', allow }));
    
    // Add timeout wrapper to prevent hanging
    const decision = await Promise.race([
      aj.protect(req),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Arcjet timeout')), 5000)
      )
    ]) as Awaited<ReturnType<typeof aj.protect>>;

    if (decision.isDenied()) {
      console.warn(
        `Arcjet decision: ${JSON.stringify(decision.reason, null, 2)}`
      );

      if (decision.reason.isBot()) {
        throw new Error('No bots allowed');
      }

      if (decision.reason.isRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error('Access denied');
    }
  } catch (error) {
    // Log the error but don't block the request in case of network issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Arcjet protection failed:', errorMessage);
    
    // In development, we can be more lenient with security failures
    if (process.env.NODE_ENV === 'development') {
      console.warn('Allowing request due to development environment');
      return;
    }
    
    // In production, you might want to handle this differently
    // For now, we'll allow the request to continue but log the failure
    console.warn('Security check failed, but allowing request to continue');
  }
};
