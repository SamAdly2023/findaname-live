
// ==========================================
// DOMAIN INTELLIGENCE HUB - TYPE DEFINITIONS
// ==========================================

export enum DomainStatus {
  Available = 'Available',
  Taken = 'Taken',
  Unknown = 'Unknown',
}

export interface DomainInfo {
  name: string;
  status: DomainStatus;
  description?: string;
}

// ==========================================
// MODULE 1: ENHANCED DOMAIN VALUE ENGINE
// ==========================================

export interface WhoisData {
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  nameServers?: string[];
  status?: string[];
  error?: string;
  rawText?: string;
}

export interface CompSale {
  domain: string;
  price: number;
  date: string;
  source?: string;
  tld?: string;
  similarity?: number; // 0-100 score of how similar to target domain
}

export interface SEOMetrics {
  searchVolume: string;
  monthlySearches: number;
  cpc: string;
  cpcValue: number;
  keywordDifficulty: string;
  competitionLevel: 'Low' | 'Medium' | 'High';
  organicCTR: string;
  serpFeatures: string[];
  relatedKeywords: string[];
}

export interface BrandabilityScore {
  score: number; // 1-10
  reasoning: string;
  lengthScore: number; // 1-10
  phoneticScore: number; // 1-10 (easy to pronounce/remember)
  extensionScore: number; // 1-10 (.com = 10, .live = 6, etc.)
  uniquenessScore: number; // 1-10
  memorabilityScore: number; // 1-10
  spellabilityScore: number; // 1-10 (easy to spell correctly)
}

export interface LiquidityRating {
  rating: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  score: number; // 1-100
  turnoverRate: string;
  estimatedDaysToSell: string;
  marketDemand: 'Cold' | 'Warm' | 'Hot';
  buyerPool: string;
  reasoning: string;
}

export interface SpamRiskAssessment {
  score: number; // 0-100 (100 is high risk)
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: string[];
  blacklistStatus: {
    checked: boolean;
    listedOn: string[];
    cleanLists: string[];
  };
  historicalFlags: string[];
  recommendations: string[];
}

export interface MarketAnalysis {
  estimatedValue: number;
  valueRange: { min: number; max: number };
  currency: string;
  confidence: number; // 0-100 confidence in the estimate
  comps: CompSale[];
  seoPotential: SEOMetrics;
  brandability: BrandabilityScore;
  liquidity: LiquidityRating;
  spamRisk: SpamRiskAssessment;
  marketTrends: {
    tldGrowth: string;
    industryDemand: string;
    priceDirection: 'Rising' | 'Stable' | 'Declining';
  };
  generatedAt: string;
}

// ==========================================
// MODULE 2: BRAND IDENTITY SUITE
// ==========================================

export type SocialPlatform = 'X' | 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Facebook' | 'GitHub' | 'Reddit';

export interface SocialAvailability {
  platform: SocialPlatform;
  available: boolean | 'unknown';
  url: string;
  handle: string;
  checkMethod: 'api' | 'heuristic' | 'manual';
  lastChecked: string;
  error?: string;
}

export interface SocialCheckResult {
  handle: string;
  platforms: SocialAvailability[];
  overallAvailability: number; // Percentage of available handles
  recommendations: string[];
  checkedAt: string;
}

export interface AILogoPrompt {
  brandName: string;
  style: 'modern' | 'classic' | 'playful' | 'professional' | 'minimalist';
  primaryColor?: string;
  industry?: string;
  generatedPrompt: string;
}

export interface BrandIdentityPackage {
  domain: string;
  socialHandles: SocialCheckResult;
  suggestedLogos: AILogoPrompt[];
  colorPalette: string[];
  taglineSuggestions: string[];
  brandVoice: string;
}

// ==========================================
// MODULE 3: SEO & RISK INTELLIGENCE
// ==========================================

export interface WhoisHistoryRecord {
  date: string;
  event: 'registration' | 'transfer' | 'renewal' | 'dns_update' | 'status_change' | 'expiration';
  registrar?: string;
  owner?: string; // Usually privacy protected
  nameservers?: string[];
  change: string;
}

export interface WhoisHistorySummary {
  domain: string;
  totalOwnerChanges: number;
  registrationAge: string;
  history: WhoisHistoryRecord[];
  firstRegistered?: string;
  hasDropHistory: boolean;
  stabilityScore: number; // 1-100 (higher = more stable ownership)
}

export interface WaybackData {
  domain: string;
  archiveUrl: string;
  firstSnapshot?: string;
  lastSnapshot?: string;
  totalSnapshots: number;
  hasHistory: boolean;
}

export interface BlacklistCheckResult {
  list: string;
  listed: boolean;
  reason?: string;
  lastChecked: string;
}

export interface SpamRiskReport {
  domain: string;
  overallScore: number; // 0-100
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
  blacklistResults: BlacklistCheckResult[];
  spamIndicators: {
    indicator: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  contentFlags: string[];
  recommendations: string[];
  lastUpdated: string;
}

export interface SEORiskIntelligence {
  domain: string;
  whoisHistory: WhoisHistorySummary;
  waybackData: WaybackData;
  spamRisk: SpamRiskReport;
  overallHealthScore: number; // 0-100
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ==========================================
// MODULE 4: GHL ECOSYSTEM INTEGRATION
// ==========================================

export interface GHLWebhookPayload {
  domain: string;
  estimatedValue: number;
  brandabilityScore: number;
  seoScore: number;
  riskLevel: string;
  marketAnalysis: MarketAnalysis;
  socialAvailability: SocialCheckResult;
  seoIntelligence: SEORiskIntelligence;
  metadata: {
    generatedAt: string;
    reportVersion: string;
    source: string;
  };
  customFields?: Record<string, any>;
}

export interface GHLDeploymentConfig {
  webhookUrl: string;
  locationId?: string;
  funnelMapping?: string;
  customMenuLink?: string;
  tags?: string[];
}

export interface GHLDeploymentResult {
  success: boolean;
  deploymentId?: string;
  message: string;
  timestamp: string;
  webhookResponse?: any;
}

// ==========================================
// COMPREHENSIVE REPORT TYPE
// ==========================================

export interface DomainIntelligenceReport {
  domain: string;
  generatedAt: string;
  reportId: string;
  marketAnalysis: MarketAnalysis;
  brandIdentity: BrandIdentityPackage;
  seoRiskIntelligence: SEORiskIntelligence;
  ghlDeployment?: GHLDeploymentResult;
  exportedPDF?: string; // Base64 or URL
}

// ==========================================
// CREDITS & USER SYSTEM
// ==========================================

export interface CreditUsage {
  action: string;
  cost: number;
  timestamp: string;
  domain?: string;
}

export interface UserCredits {
  remaining: number;
  total: number;
  resetDate: string;
  history: CreditUsage[];
}
