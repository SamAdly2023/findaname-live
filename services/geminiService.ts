import { GoogleGenAI, Type } from '@google/genai';
import type { WhoisData } from '../types';
import { DomainStatus } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a list of creative domain names based on a keyword using the Gemini API.
 * @param keyword - The keyword to base domain names on.
 * @returns A promise that resolves to an array of objects, each with a domain name and a creative description.
 */
export const generateDomains = async (keyword: string): Promise<{name: string, description: string}[]> => {
  const prompt = `
    As a world-class branding expert and a savvy affiliate marketer, generate 21 creative and brandable domain names based on the concept: "${keyword}".

    Your suggestions must be strategically optimized for high affiliate commissions on registrars like GoDaddy.
    
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
    return [];
  }
};

/**
 * Checks domain availability using the GoDaddy API.
 * @param domainName - The domain name to check.
 * @returns A promise that resolves to DomainStatus.
 */
export const checkAvailability = async (domainName: string): Promise<DomainStatus> => {
  // --- ACTION REQUIRED: REPLACE PLACEHOLDERS WITH YOUR GODADDY CREDENTIALS ---
  // 1. Get your API Key & Secret from the GoDaddy Developer Portal: https://developer.godaddy.com/keys
  // 2. You may need to request production access for real-world use.

  const API_KEY = 'your_godaddy_api_key';     // <-- PASTE your GoDaddy API Key here
  const API_SECRET = 'your_godaddy_api_secret'; // <-- PASTE your GoDaddy API Secret here
  
  // For testing, use the OTE (Operational Test Environment) URL. For production, change to 'https://api.godaddy.com'.
  const API_ENDPOINT = 'https://api.ote-godaddy.com/v1/domains/available';

  const url = `${API_ENDPOINT}?domain=${domainName}`;

  try {
    // If your API credentials are just placeholders, the call will be skipped.
    if (API_KEY === 'your_godaddy_api_key' || API_SECRET === 'your_godaddy_api_secret') {
        console.warn("GoDaddy API credentials are placeholders. Domain check is disabled.");
        return DomainStatus.Unknown;
    }
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `sso-key ${API_KEY}:${API_SECRET}`
      }
    });
    
    if (!response.ok) {
        console.error("GoDaddy API request failed:", response.status, response.statusText);
        const errorBody = await response.json().catch(() => ({}));
        console.error("Error details:", errorBody);
        return DomainStatus.Unknown;
    }

    const data = await response.json();
    
    if (data.available) {
      return DomainStatus.Available;
    } else {
      return DomainStatus.Taken;
    }
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return DomainStatus.Unknown;
  }
};


/**
 * Generates simulated WHOIS data for a given domain name using the Gemini API.
 * @param domainName - The domain for which to generate WHOIS data.
 * @returns A promise that resolves to a WhoisData object.
 */
export const getWhoisInfo = async (domainName: string): Promise<WhoisData> => {
  const prompt = `Generate realistic but fake WHOIS data for the registered domain "${domainName}". Provide data for registrar, creation date, expiration date, name servers, and domain status.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          registrar: { type: Type.STRING, description: "e.g., GoDaddy, Namecheap" },
          creationDate: { type: Type.STRING, description: "ISO 8601 format date" },
          expirationDate: { type: Type.STRING, description: "ISO 8601 format date" },
          nameServers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "e.g., ['ns1.domain.com', 'ns2.domain.com']"
          },
          status: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "e.g., ['clientTransferProhibited', 'ok']"
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
