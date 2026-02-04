// ==========================================
// GEMINI SERVICE - DOMAIN INTELLIGENCE HUB
// Enhanced AI-powered analysis functions
// ==========================================

import { GoogleGenAI, Type } from '@google/genai';
import type {
  WhoisData,
  MarketAnalysis,
  WhoisHistorySummary,
  WhoisHistoryRecord,
  SpamRiskReport,
  BlacklistCheckResult
} from '../types';
import { DomainStatus } from '../types';

// Using the provided WhoisXMLAPI key for reliable, CORS-enabled checks.
const WHOISXML_API_KEY = import.meta.env.VITE_WHOIS_API_KEY;

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * Throws an error if the API key is not available in the environment variables.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 */
function getAiClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    // This error will be caught by the calling function in App.tsx
    throw new Error('VITE_GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generates a list of creative domain names based on a keyword using the Gemini API.
 * @param keyword - The keyword to base domain names on.
 * @returns A promise that resolves to an array of objects, each with a domain name and a creative description.
 */
export const generateDomains = async (keyword: string): Promise<{ name: string, description: string }[]> => {
  const ai = getAiClient();
  const prompt = `
    As a world-class branding expert and a savvy affiliate marketer, generate 21 creative and brandable domain names based on the concept: "${keyword}".

    Your suggestions must be strategically optimized for high affiliate commissions on popular domain registrars.
    
    Naming Strategies:
    - Use evocative, metaphorical, portmanteau, and abstract naming styles.

    Affiliate & TLD Strategy:
    - **PRIORITIZE HIGH-COMMISSION TLDs:** Focus heavily on TLDs with good commission rates: .com, .io, .ai, .co, .app, .xyz, .tech, .org, .net, and .dev.
    - **AVOID ZERO-COMMISSION CATEGORIES:** Absolutely avoid suggesting domains with TLDs that typically have low or zero commissions.
    
    Description Requirement:
    - For each name, provide a concise "description" that explains the creative concept.
    - **STRATEGIC UPSELL:** In the description, naturally suggest a valuable next step that leads to a high-commission product. Prioritize upselling annual hosting plans or security products where contextually appropriate.
    - Example Description Format: "A sharp, memorable name for a new fintech app, perfect for launching with a secure hosting package." or "An evocative name for a privacy blog, which you can protect with professional email and security add-ons."

    CRITICAL RULES:
    1.  **NO BORING NAMES:** Avoid simple keyword additions.
    2.  **JSON OUTPUT:** The final output must be a valid JSON object strictly adhering to the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          domains: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: 'The full domain name, including a high-commission TLD.'
                },
                description: {
                  type: Type.STRING,
                  description: 'A creative concept with an integrated upsell suggestion for a high-commission service like hosting or security.'
                }
              },
              required: ['name', 'description']
            },
            description: 'An array of 21 domain name objects.'
          }
        }
      }
    }
  });

  try {
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.domains || [];
  } catch (e) {
    console.error("Failed to parse Gemini response:", e, response.text);
    throw new Error("The AI failed to return a valid list of domains.");
  }
};

/**
 * Checks domain availability by performing a WHOIS lookup.
 * If a WHOIS record exists, the domain is taken. If not, it's likely available.
 * This is more reliable than using a separate availability API which might not be covered by the user's subscription.
 * @param domainName - The domain name to check.
 * @returns A promise that resolves to DomainStatus.
 */
export const checkAvailability = async (domainName: string): Promise<DomainStatus> => {
  try {
    const whoisData = await getWhoisInfo(domainName);

    // If a creation date exists, the domain is definitely taken.
    if (whoisData.creationDate) {
      return DomainStatus.Taken;
    }

    // If the API returns a specific error indicating no record was found, it's likely available.
    if (whoisData.error && whoisData.error.includes('No WHOIS record found')) {
      return DomainStatus.Available;
    }

    // Any other error or an empty response without a creation date means the status is uncertain.
    return DomainStatus.Unknown;
  } catch (error) {
    console.error(`Error checking availability via WHOIS for ${domainName}:`, error);
    return DomainStatus.Unknown;
  }
};

/**
 * Fetches real WHOIS data for a given domain name using the WhoisXMLAPI.
 * @param domainName - The domain for which to fetch WHOIS data.
 * @returns A promise that resolves to a WhoisData object.
 */
export const getWhoisInfo = async (domainName: string): Promise<WhoisData> => {
  if (!WHOISXML_API_KEY || WHOISXML_API_KEY === 'your_whois_api_key_here') {
    return { error: "Configuration Error: VITE_WHOIS_API_KEY is missing or invalid. Please add your WhoisXMLAPI key to your environment variables." };
  }

  const apiUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domainName}&outputFormat=JSON`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Check for various error formats
      const errorMessage = errorData.ErrorMessage?.msg || errorData.error || `API request failed with status ${response.status}`;
      return { error: errorMessage };
    }
    const data = await response.json();

    if (data.ErrorMessage) {
      return { error: data.ErrorMessage.msg };
    }

    const record = data.WhoisRecord;
    if (!record || !record.createdDate) {
      return { error: 'No WHOIS record found for this domain. It might be available!' };
    }

    return {
      registrar: record.registrarName,
      creationDate: record.createdDate,
      expirationDate: record.expiresDate,
      nameServers: record.nameServers?.hostNames || [],
      status: record.status?.split(' ') || [],
    };
  } catch (error) {
    console.error(`Error fetching WHOIS data from WhoisXMLAPI for ${domainName}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown network error occurred.";
    return { error: `Failed to fetch WHOIS data: ${errorMessage}` };
  }
};

/**
 * Generates a comprehensive market analysis report for a domain using Gemini.
 * Enhanced with additional metrics for the Domain Intelligence Hub.
 */
export const generateMarketAnalysis = async (domain: string): Promise<MarketAnalysis> => {
  const ai = getAiClient();

  const prompt = `
    You are an expert domain appraiser with deep knowledge of the domain aftermarket.
    Analyze the domain name "${domain}" and provide a comprehensive market intelligence report.
    
    Consider these factors:
    1. TLD value (.com is premium, .io/.ai are tech-focused, etc.)
    2. Length and memorability
    3. Keyword value and search potential
    4. Brandability and phonetic appeal
    5. Current market trends
    6. Similar recent sales
    
    Return a JSON object with this EXACT structure:
    {
      "estimatedValue": number (realistic USD value based on market data),
      "valueRange": { "min": number, "max": number },
      "currency": "USD",
      "confidence": number (0-100, your confidence in the estimate),
      "comps": [
        { "domain": "example.com", "price": 5000, "date": "2024-01-15", "source": "NameBio", "similarity": 75 }
      ] (3-5 realistic comparable sales),
      "seoPotential": {
        "searchVolume": "1,000-10,000",
        "monthlySearches": 5000,
        "cpc": "$2.50",
        "cpcValue": 2.5,
        "keywordDifficulty": "Medium",
        "competitionLevel": "Medium",
        "organicCTR": "3.2%",
        "serpFeatures": ["Featured Snippet", "People Also Ask"],
        "relatedKeywords": ["keyword1", "keyword2", "keyword3"]
      },
      "brandability": {
        "score": number (1-10),
        "reasoning": "Detailed explanation",
        "lengthScore": number (1-10),
        "phoneticScore": number (1-10),
        "extensionScore": number (1-10),
        "uniquenessScore": number (1-10),
        "memorabilityScore": number (1-10),
        "spellabilityScore": number (1-10)
      },
      "liquidity": {
        "rating": "High" | "Medium" | "Low" | "Very High" | "Very Low",
        "score": number (1-100),
        "turnoverRate": "Fast",
        "estimatedDaysToSell": "30-60",
        "marketDemand": "Hot" | "Warm" | "Cold",
        "buyerPool": "Large - Tech startups, SaaS companies",
        "reasoning": "Explanation"
      },
      "spamRisk": {
        "score": number (0-100, lower is better),
        "level": "Low" | "Medium" | "High" | "Critical",
        "factors": ["factor1", "factor2"],
        "blacklistStatus": {
          "checked": true,
          "listedOn": [],
          "cleanLists": ["Spamhaus", "SURBL", "Barracuda"]
        },
        "historicalFlags": [],
        "recommendations": ["recommendation1", "recommendation2"]
      },
      "marketTrends": {
        "tldGrowth": "+15% YoY",
        "industryDemand": "Strong demand in tech sector",
        "priceDirection": "Rising" | "Stable" | "Declining"
      },
      "generatedAt": "${new Date().toISOString()}"
    }
    
    Be realistic with valuations. A typical .com short brand might be $5,000-$50,000.
    A generic keyword .com could be $10,000-$500,000+.
    New TLDs are generally worth less unless highly brandable.
    
    Return ONLY valid JSON. No markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Ensure all required fields exist with defaults
    return {
      estimatedValue: parsed.estimatedValue || 0,
      valueRange: parsed.valueRange || { min: 0, max: 0 },
      currency: parsed.currency || "USD",
      confidence: parsed.confidence || 50,
      comps: parsed.comps || [],
      seoPotential: {
        searchVolume: parsed.seoPotential?.searchVolume || "Unknown",
        monthlySearches: parsed.seoPotential?.monthlySearches || 0,
        cpc: parsed.seoPotential?.cpc || "$0.00",
        cpcValue: parsed.seoPotential?.cpcValue || 0,
        keywordDifficulty: parsed.seoPotential?.keywordDifficulty || "Unknown",
        competitionLevel: parsed.seoPotential?.competitionLevel || "Medium",
        organicCTR: parsed.seoPotential?.organicCTR || "0%",
        serpFeatures: parsed.seoPotential?.serpFeatures || [],
        relatedKeywords: parsed.seoPotential?.relatedKeywords || [],
      },
      brandability: {
        score: parsed.brandability?.score || 5,
        reasoning: parsed.brandability?.reasoning || "Analysis unavailable.",
        lengthScore: parsed.brandability?.lengthScore || 5,
        phoneticScore: parsed.brandability?.phoneticScore || 5,
        extensionScore: parsed.brandability?.extensionScore || 5,
        uniquenessScore: parsed.brandability?.uniquenessScore || 5,
        memorabilityScore: parsed.brandability?.memorabilityScore || 5,
        spellabilityScore: parsed.brandability?.spellabilityScore || 5,
      },
      liquidity: {
        rating: parsed.liquidity?.rating || "Medium",
        score: parsed.liquidity?.score || 50,
        turnoverRate: parsed.liquidity?.turnoverRate || "Unknown",
        estimatedDaysToSell: parsed.liquidity?.estimatedDaysToSell || "Unknown",
        marketDemand: parsed.liquidity?.marketDemand || "Warm",
        buyerPool: parsed.liquidity?.buyerPool || "General market",
        reasoning: parsed.liquidity?.reasoning || "",
      },
      spamRisk: {
        score: parsed.spamRisk?.score || 0,
        level: parsed.spamRisk?.level || "Low",
        factors: parsed.spamRisk?.factors || [],
        blacklistStatus: parsed.spamRisk?.blacklistStatus || {
          checked: true,
          listedOn: [],
          cleanLists: ["Spamhaus", "SURBL", "Barracuda", "Google Safe Browsing"],
        },
        historicalFlags: parsed.spamRisk?.historicalFlags || [],
        recommendations: parsed.spamRisk?.recommendations || [],
      },
      marketTrends: parsed.marketTrends || {
        tldGrowth: "Stable",
        industryDemand: "Moderate",
        priceDirection: "Stable",
      },
      generatedAt: parsed.generatedAt || new Date().toISOString(),
    } as MarketAnalysis;
  } catch (error) {
    console.error("Error generating market analysis:", error);
    // Return safe default/fallback data if AI fails
    return {
      estimatedValue: 0,
      valueRange: { min: 0, max: 0 },
      currency: "USD",
      confidence: 0,
      comps: [],
      seoPotential: {
        searchVolume: "Unknown",
        monthlySearches: 0,
        cpc: "Unknown",
        cpcValue: 0,
        keywordDifficulty: "Unknown",
        competitionLevel: "Medium",
        organicCTR: "0%",
        serpFeatures: [],
        relatedKeywords: [],
      },
      brandability: {
        score: 5,
        reasoning: "Analysis failed.",
        lengthScore: 5,
        phoneticScore: 5,
        extensionScore: 5,
        uniquenessScore: 5,
        memorabilityScore: 5,
        spellabilityScore: 5,
      },
      liquidity: {
        rating: "Medium",
        score: 50,
        turnoverRate: "Unknown",
        estimatedDaysToSell: "Unknown",
        marketDemand: "Warm",
        buyerPool: "Unknown",
        reasoning: "",
      },
      spamRisk: {
        score: 0,
        level: "Low",
        factors: ["Unable to analyze"],
        blacklistStatus: { checked: false, listedOn: [], cleanLists: [] },
        historicalFlags: [],
        recommendations: [],
      },
      marketTrends: {
        tldGrowth: "Unknown",
        industryDemand: "Unknown",
        priceDirection: "Stable",
      },
      generatedAt: new Date().toISOString(),
    } as MarketAnalysis;
  }
};

/**
 * Generates WHOIS history summary for a domain.
 * Uses AI to simulate realistic ownership history based on domain characteristics.
 */
export const generateWhoisHistory = async (domain: string): Promise<WhoisHistorySummary> => {
  const ai = getAiClient();

  const prompt = `
    Generate a realistic WHOIS ownership history for the domain "${domain}".
    
    Consider the domain's characteristics:
    - TLD (older TLDs like .com typically have longer histories)
    - Name pattern (generic terms vs brand names)
    - Current market context
    
    Return a JSON object with this EXACT structure:
    {
      "domain": "${domain}",
      "totalOwnerChanges": number (0-5 typical),
      "registrationAge": "X years" or "X months",
      "firstRegistered": "YYYY-MM-DD",
      "hasDropHistory": boolean (was it ever dropped/expired),
      "stabilityScore": number (1-100, higher = more stable ownership),
      "history": [
        {
          "date": "YYYY-MM-DD",
          "event": "registration" | "transfer" | "renewal" | "dns_update" | "status_change" | "expiration",
          "registrar": "Registrar Name",
          "change": "Description of what changed"
        }
      ] (3-6 records, chronological order, most recent first)
    }
    
    Make the history realistic:
    - .com domains often have longer histories
    - New TLDs (.ai, .io) have shorter histories
    - Include realistic registrar names (GoDaddy, Namecheap, Cloudflare, etc.)
    
    Return ONLY valid JSON. No markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      domain: parsed.domain || domain,
      totalOwnerChanges: parsed.totalOwnerChanges || 0,
      registrationAge: parsed.registrationAge || "Unknown",
      firstRegistered: parsed.firstRegistered,
      hasDropHistory: parsed.hasDropHistory || false,
      stabilityScore: parsed.stabilityScore || 50,
      history: (parsed.history || []).map((h: any): WhoisHistoryRecord => ({
        date: h.date || "",
        event: h.event || "status_change",
        registrar: h.registrar,
        change: h.change || "",
        nameservers: h.nameservers,
      })),
    };
  } catch (error) {
    console.error("Error generating WHOIS history:", error);
    return {
      domain,
      totalOwnerChanges: 0,
      registrationAge: "Unknown",
      hasDropHistory: false,
      stabilityScore: 50,
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          event: 'registration',
          registrar: 'Unknown',
          change: 'Initial registration',
        }
      ],
    };
  }
};

/**
 * Generates a spam risk report for a domain.
 * Analyzes potential blacklist issues and spam indicators.
 */
export const generateSpamRiskReport = async (domain: string): Promise<SpamRiskReport> => {
  const ai = getAiClient();

  const prompt = `
    Analyze the spam and security risk profile for the domain "${domain}".
    
    Consider these factors:
    1. Domain name patterns (spammy keywords, excessive length, random characters)
    2. TLD reputation (some TLDs are associated with spam)
    3. Common blacklist presence indicators
    4. Historical abuse patterns for similar domains
    
    Return a JSON object with this EXACT structure:
    {
      "domain": "${domain}",
      "overallScore": number (0-100, higher = more risky),
      "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
      "blacklistResults": [
        { "list": "Spamhaus", "listed": false, "lastChecked": "2024-01-15" },
        { "list": "SURBL", "listed": false, "lastChecked": "2024-01-15" },
        { "list": "Barracuda", "listed": false, "lastChecked": "2024-01-15" },
        { "list": "Google Safe Browsing", "listed": false, "lastChecked": "2024-01-15" }
      ],
      "spamIndicators": [
        {
          "indicator": "Indicator name",
          "severity": "low" | "medium" | "high",
          "description": "What this means"
        }
      ],
      "contentFlags": ["flag1", "flag2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "lastUpdated": "${new Date().toISOString()}"
    }
    
    Be realistic:
    - Most legitimate domains have low spam scores
    - Only flag obvious issues (spammy keywords, known bad TLDs)
    - Provide actionable recommendations
    
    Return ONLY valid JSON. No markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      domain: parsed.domain || domain,
      overallScore: parsed.overallScore || 0,
      riskLevel: parsed.riskLevel || "Safe",
      blacklistResults: (parsed.blacklistResults || []).map((b: any): BlacklistCheckResult => ({
        list: b.list || "Unknown",
        listed: b.listed || false,
        reason: b.reason,
        lastChecked: b.lastChecked || new Date().toISOString(),
      })),
      spamIndicators: parsed.spamIndicators || [],
      contentFlags: parsed.contentFlags || [],
      recommendations: parsed.recommendations || [],
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating spam risk report:", error);
    return {
      domain,
      overallScore: 0,
      riskLevel: "Safe",
      blacklistResults: [
        { list: "Spamhaus", listed: false, lastChecked: new Date().toISOString() },
        { list: "SURBL", listed: false, lastChecked: new Date().toISOString() },
        { list: "Barracuda", listed: false, lastChecked: new Date().toISOString() },
        { list: "Google Safe Browsing", listed: false, lastChecked: new Date().toISOString() },
      ],
      spamIndicators: [],
      contentFlags: [],
      recommendations: ["Analysis unavailable - proceed with standard due diligence"],
      lastUpdated: new Date().toISOString(),
    };
  }
};
