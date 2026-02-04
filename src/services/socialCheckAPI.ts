
// ==========================================
// SOCIAL CHECK API - DOMAIN INTELLIGENCE HUB
// ==========================================

import {
  SocialAvailability,
  SocialCheckResult,
  SocialPlatform,
  GHLWebhookPayload,
  GHLDeploymentConfig,
  GHLDeploymentResult,
  MarketAnalysis,
  SEORiskIntelligence
} from '../types';

// API Configuration
const SOCIAL_CHECK_TIMEOUT = 8000; // 8 seconds timeout per platform

/**
 * Platform-specific API endpoints and checking strategies
 * Note: Direct client-side checks are often blocked by CORS.
 * This implementation uses multiple strategies:
 * 1. Public APIs where available
 * 2. Known URL patterns for availability hints
 * 3. Proxy endpoints for production (configurable)
 */
const PLATFORM_CONFIG: Record<SocialPlatform, {
  baseUrl: string;
  profilePath: string;
  checkStrategy: 'api' | 'heuristic' | 'proxy';
  apiEndpoint?: string;
}> = {
  'X': {
    baseUrl: 'https://twitter.com',
    profilePath: '/',
    checkStrategy: 'heuristic',
  },
  'Instagram': {
    baseUrl: 'https://instagram.com',
    profilePath: '/',
    checkStrategy: 'heuristic',
  },
  'TikTok': {
    baseUrl: 'https://tiktok.com',
    profilePath: '/@',
    checkStrategy: 'heuristic',
  },
  'YouTube': {
    baseUrl: 'https://youtube.com',
    profilePath: '/@',
    checkStrategy: 'heuristic',
  },
  'LinkedIn': {
    baseUrl: 'https://linkedin.com',
    profilePath: '/company/',
    checkStrategy: 'heuristic',
  },
  'Facebook': {
    baseUrl: 'https://facebook.com',
    profilePath: '/',
    checkStrategy: 'heuristic',
  },
  'GitHub': {
    baseUrl: 'https://github.com',
    profilePath: '/',
    checkStrategy: 'api',
    apiEndpoint: 'https://api.github.com/users/',
  },
  'Reddit': {
    baseUrl: 'https://reddit.com',
    profilePath: '/user/',
    checkStrategy: 'api',
    apiEndpoint: 'https://www.reddit.com/user/',
  },
};

/**
 * Normalizes a domain name to a clean handle
 * Removes TLD, spaces, and special characters
 */
export const normalizeHandle = (domain: string): string => {
  return domain
    .replace(/\.[a-z]+$/i, '') // Remove TLD
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special chars except underscore
    .toLowerCase()
    .slice(0, 15); // Most platforms have a 15 char limit
};

/**
 * Check availability on GitHub (has public API)
 */
const checkGitHub = async (handle: string): Promise<SocialAvailability> => {
  const config = PLATFORM_CONFIG['GitHub'];
  try {
    const response = await fetch(`${config.apiEndpoint}${handle}`, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    return {
      platform: 'GitHub',
      available: response.status === 404,
      url: `${config.baseUrl}${config.profilePath}${handle}`,
      handle,
      checkMethod: 'api',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: 'GitHub',
      available: 'unknown',
      url: `${config.baseUrl}${config.profilePath}${handle}`,
      handle,
      checkMethod: 'api',
      lastChecked: new Date().toISOString(),
      error: 'API check failed',
    };
  }
};

/**
 * Check availability on Reddit (has somewhat accessible endpoint)
 */
const checkReddit = async (handle: string): Promise<SocialAvailability> => {
  const config = PLATFORM_CONFIG['Reddit'];
  try {
    const response = await fetch(`${config.apiEndpoint}${handle}/about.json`, {
      method: 'GET',
    });

    const data = await response.json();
    const isTaken = data.data && data.data.name;

    return {
      platform: 'Reddit',
      available: !isTaken,
      url: `${config.baseUrl}${config.profilePath}${handle}`,
      handle,
      checkMethod: 'api',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: 'Reddit',
      available: 'unknown',
      url: `${config.baseUrl}${config.profilePath}${handle}`,
      handle,
      checkMethod: 'api',
      lastChecked: new Date().toISOString(),
      error: 'API check failed - check manually',
    };
  }
};

/**
 * Heuristic-based availability check
 * Uses handle complexity and known patterns to estimate availability
 * More accurate for short/simple handles (likely taken) vs complex ones
 */
const heuristicCheck = (handle: string, platform: SocialPlatform): SocialAvailability => {
  const config = PLATFORM_CONFIG[platform];

  // Heuristic factors that suggest a handle is likely taken:
  // - Very short (< 4 chars) = almost certainly taken on major platforms
  // - Common words = likely taken
  // - Numbers only = often taken
  // - Very long (> 12 chars) = more likely available

  const factors = {
    isVeryShort: handle.length < 4,
    isShort: handle.length < 6,
    isLong: handle.length > 12,
    hasNumbers: /\d/.test(handle),
    isAllNumbers: /^\d+$/.test(handle),
    hasUnderscore: handle.includes('_'),
    isCommonWord: ['app', 'web', 'tech', 'ai', 'dev', 'code', 'data', 'cloud', 'net', 'io', 'hub', 'lab', 'pro'].includes(handle),
  };

  // Calculate probability of being taken (0-100)
  let takenProbability = 50; // Base probability

  if (factors.isVeryShort) takenProbability += 40;
  else if (factors.isShort) takenProbability += 25;
  else if (factors.isLong) takenProbability -= 30;

  if (factors.isCommonWord) takenProbability += 30;
  if (factors.isAllNumbers && handle.length < 6) takenProbability += 35;
  if (factors.hasUnderscore) takenProbability -= 15;
  if (factors.hasNumbers && !factors.isAllNumbers) takenProbability -= 10;

  // Clamp to 0-100
  takenProbability = Math.max(0, Math.min(100, takenProbability));

  // For X (Twitter) and Instagram, short handles are EXTREMELY rare to be available
  if ((platform === 'X' || platform === 'Instagram') && handle.length < 5) {
    takenProbability = 95;
  }

  return {
    platform,
    available: takenProbability < 50 ? true : takenProbability > 70 ? false : 'unknown',
    url: `${config.baseUrl}${config.profilePath}${handle}`,
    handle,
    checkMethod: 'heuristic',
    lastChecked: new Date().toISOString(),
  };
};

/**
 * Check a single platform for handle availability
 */
const checkPlatform = async (handle: string, platform: SocialPlatform): Promise<SocialAvailability> => {
  const config = PLATFORM_CONFIG[platform];

  try {
    switch (config.checkStrategy) {
      case 'api':
        if (platform === 'GitHub') return await checkGitHub(handle);
        if (platform === 'Reddit') return await checkReddit(handle);
        return heuristicCheck(handle, platform);

      case 'heuristic':
      default:
        return heuristicCheck(handle, platform);
    }
  } catch (error) {
    return {
      platform,
      available: 'unknown',
      url: `${config.baseUrl}${config.profilePath}${handle}`,
      handle,
      checkMethod: 'heuristic',
      lastChecked: new Date().toISOString(),
      error: 'Check failed',
    };
  }
};

/**
 * Main function to check social media handle availability across platforms
 * @param name - Domain name or brand name to check
 * @param platforms - Optional array of specific platforms to check
 * @returns Promise<SocialCheckResult>
 */
export const checkSocialHandles = async (
  name: string,
  platforms: SocialPlatform[] = ['X', 'Instagram', 'TikTok', 'YouTube']
): Promise<SocialCheckResult> => {
  const handle = normalizeHandle(name);

  // Check all platforms in parallel
  const results = await Promise.all(
    platforms.map(platform => checkPlatform(handle, platform))
  );

  // Calculate overall availability percentage
  const availableCount = results.filter(r => r.available === true).length;
  const unknownCount = results.filter(r => r.available === 'unknown').length;
  const overallAvailability = Math.round(
    ((availableCount + (unknownCount * 0.5)) / results.length) * 100
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (overallAvailability >= 75) {
    recommendations.push('✅ Great handle availability! Consider registering quickly on all platforms.');
  } else if (overallAvailability >= 50) {
    recommendations.push('🟡 Mixed availability. Consider adding numbers or underscores for taken platforms.');
  } else {
    recommendations.push('🔴 Handle is likely taken on most platforms. Consider alternative variations.');
  }

  if (handle.length < 5) {
    recommendations.push('💡 Short handles are premium - they\'re almost always taken on major platforms.');
  }

  const unavailablePlatforms = results.filter(r => r.available === false).map(r => r.platform);
  if (unavailablePlatforms.length > 0) {
    recommendations.push(`Try variations: ${handle}_official, ${handle}app, get${handle}, the${handle}`);
  }

  return {
    handle,
    platforms: results,
    overallAvailability,
    recommendations,
    checkedAt: new Date().toISOString(),
  };
};

// ==========================================
// GHL (GOHIGHLEVEL) ECOSYSTEM INTEGRATION
// ==========================================

/**
 * Prepares the domain data payload for GoHighLevel webhook
 */
export const prepareGHLPayload = (
  domain: string,
  marketAnalysis: MarketAnalysis,
  socialResult: SocialCheckResult,
  seoIntelligence: SEORiskIntelligence,
  customFields?: Record<string, any>
): GHLWebhookPayload => {
  return {
    domain,
    estimatedValue: marketAnalysis.estimatedValue,
    brandabilityScore: marketAnalysis.brandability.score,
    seoScore: Math.round((marketAnalysis.seoPotential.monthlySearches / 1000) * 10), // Normalized score
    riskLevel: marketAnalysis.spamRisk.level,
    marketAnalysis,
    socialAvailability: socialResult,
    seoIntelligence,
    metadata: {
      generatedAt: new Date().toISOString(),
      reportVersion: '2.0.0',
      source: 'FindAName.live Domain Intelligence Hub',
    },
    customFields,
  };
};

/**
 * Sends domain intelligence data to GoHighLevel webhook
 * Can be used for Custom Menu Links, Funnel mapping, or CRM integration
 */
export const deployToGHL = async (
  payload: GHLWebhookPayload,
  config: GHLDeploymentConfig
): Promise<GHLDeploymentResult> => {
  const { webhookUrl, locationId, funnelMapping, customMenuLink, tags } = config;

  if (!webhookUrl) {
    return {
      success: false,
      message: 'Webhook URL is required for GHL deployment',
      timestamp: new Date().toISOString(),
    };
  }

  // Enhance payload with GHL-specific fields
  const ghlPayload = {
    ...payload,
    ghl_config: {
      locationId,
      funnelMapping,
      customMenuLink,
      tags: tags || ['domain-intelligence', 'findaname'],
    },
    // Standard GHL webhook fields
    contact: {
      customField: {
        domain_analyzed: payload.domain,
        estimated_value: `$${payload.estimatedValue.toLocaleString()}`,
        brandability_score: `${payload.brandabilityScore}/10`,
        risk_level: payload.riskLevel,
        report_date: payload.metadata.generatedAt,
      },
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlPayload),
    });

    if (!response.ok) {
      throw new Error(`GHL webhook returned ${response.status}`);
    }

    const responseData = await response.json().catch(() => ({}));

    return {
      success: true,
      deploymentId: responseData.id || crypto.randomUUID(),
      message: 'Successfully deployed to GoHighLevel',
      timestamp: new Date().toISOString(),
      webhookResponse: responseData,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `GHL deployment failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Validates a GHL webhook URL format
 */
export const validateGHLWebhook = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // GHL webhooks typically come from these domains
    const validDomains = [
      'hooks.leadconnectorhq.com',
      'services.leadconnectorhq.com',
      'hooks.gohighlevel.com',
      'api.gohighlevel.com',
    ];
    return validDomains.some(domain => parsed.hostname.includes(domain)) ||
      parsed.hostname.includes('webhook'); // Allow custom webhook URLs
  } catch {
    return false;
  }
};

// ==========================================
// LEGACY COMPATIBILITY WRAPPER
// ==========================================

/**
 * Legacy function for backward compatibility with existing components
 * @deprecated Use checkSocialHandles instead
 */
export const checkSocialHandlesLegacy = async (
  name: string
): Promise<Array<{ platform: 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube'; available: boolean; url?: string }>> => {
  const result = await checkSocialHandles(name, ['X', 'Instagram', 'TikTok', 'YouTube']);
  return result.platforms.map(p => ({
    platform: p.platform === 'X' ? 'Twitter' : p.platform as 'Instagram' | 'TikTok' | 'YouTube',
    available: p.available === true,
    url: p.url,
  }));
};
