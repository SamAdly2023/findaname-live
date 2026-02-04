import { GoogleGenAI, Type } from '@google/genai';
import type { WhoisData } from '../types';
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