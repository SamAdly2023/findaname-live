import { GoogleGenAI, Type } from '@google/genai';

document.addEventListener('DOMContentLoaded', () => {
    // Keys from environment variables
    const whoisApiKey = import.meta.env.VITE_WHOIS_API_KEY;
    const pagespeedApiKey = import.meta.env.VITE_PAGESPEED_API_KEY;
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Get form elements
    const dnsForm = document.getElementById('dns-lookup-form');
    const whoisForm = document.getElementById('whois-lookup-form');
    const seoForm = document.getElementById('seo-checker-form');
    const domainValueForm = document.getElementById('domain-value-form');


    /**
     * Cleans user input to return a valid domain name.
     * Removes protocols, 'www.', and paths.
     * @param {string} input - The user's input string.
     * @returns {string} A sanitized domain name.
     */
    const sanitizeDomain = (input) => {
        if (!input) return '';
        let domain = input.trim().toLowerCase();
        domain = domain.replace(/^(https?:\/\/)?/i, '');
        domain = domain.replace(/^(www\.)?/i, '');
        domain = domain.split('/')[0];
        domain = domain.split('?')[0];
        return domain;
    };

    /**
     * Validates and returns a full URL.
     * @param {string} input - The user's input string.
     * @returns {string|null} A valid URL or null.
     */
    const getValidUrl = (input) => {
        if (!input) return null;
        let url = input.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        try {
            new URL(url);
            return url;
        } catch (_) {
            return null;
        }
    }

    const showLoading = (container, text = 'Fetching data...') => {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48">
                <svg class="h-10 w-10 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <p class="mt-4 text-blue-200">${sanitizeHTML(text)}</p>
            </div>
        `;
    };

    const renderError = (container, message) => {
        container.innerHTML = `<div class="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">${sanitizeHTML(message)}</div>`;
    };

    const sanitizeHTML = (str) => {
        if (str === null || str === undefined) return '';
        const temp = document.createElement('div');
        temp.textContent = str.toString();
        return temp.innerHTML;
    };

    // --- DNS LOOKUP ---
    if (dnsForm) {
        dnsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(dnsForm.querySelector('input').value);
            if (!domain) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer);

            const recordTypesToQuery = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];
            const promises = recordTypesToQuery.map(type =>
                fetch(`https://dns.google/resolve?name=${domain}&type=${type}`)
            );

            try {
                const responses = await Promise.allSettled(promises);
                let allAnswers = [];

                for (const response of responses) {
                    if (response.status === 'fulfilled') {
                        if (response.value.ok) {
                            const data = await response.value.json();
                            if (data && data.Answer) {
                                allAnswers = allAnswers.concat(data.Answer);
                            }
                        }
                    } else {
                        console.error('A DNS fetch promise was rejected:', response.reason);
                    }
                }

                if (allAnswers.length > 0) {
                    renderGoogleDnsResults(resultsContainer, { Answer: allAnswers });
                } else {
                    renderError(resultsContainer, 'No DNS records found for this domain.');
                }

            } catch (err) {
                console.error('DNS Lookup Error:', err);
                renderError(resultsContainer, 'Failed to fetch DNS data due to a network error.');
            }
        });
    }

    // --- WHOIS LOOKUP (ENHANCED with Hosting Info) ---
    if (whoisForm) {
        whoisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(whoisForm.querySelector('input').value);
            if (!domain) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer);

            if (!whoisApiKey) {
                renderError(resultsContainer, 'WHOIS API Key is missing in environment variables.');
                return;
            }

            const whoisUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${whoisApiKey}&domainName=${domain}&outputFormat=JSON`;
            const hostingUrl = `https://ipinfo.io/${domain}/json`;

            const [whoisResponse, hostingResponse] = await Promise.allSettled([
                fetch(whoisUrl),
                fetch(hostingUrl)
            ]);

            let whoisData = null;
            let hostingData = null;
            let whoisError = null;

            if (whoisResponse.status === 'fulfilled' && whoisResponse.value.ok) {
                whoisData = await whoisResponse.value.json();
            } else {
                whoisError = 'Failed to fetch WHOIS data.';
            }

            if (hostingResponse.status === 'fulfilled' && hostingResponse.value.ok) {
                hostingData = await hostingResponse.value.json();
            }

            if (!whoisData && !hostingData) {
                return renderError(resultsContainer, whoisError || 'Could not fetch any data for this domain.');
            }

            renderWhoisAndHostingResults(resultsContainer, whoisData, hostingData);
        });
    }

    // --- SEO CHECKER ---
    if (seoForm) {
        seoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = getValidUrl(seoForm.querySelector('input').value);
            const resultsContainer = document.getElementById('results-container');

            if (!url) {
                renderError(resultsContainer, 'Please enter a valid URL (e.g., https://example.com)');
                return;
            }

            if (!pagespeedApiKey) {
                renderError(resultsContainer, 'PageSpeed API Key is missing in environment variables.');
                return;
            }

            showLoading(resultsContainer, 'Analyzing site... This may take a minute.');

            const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&key=${pagespeedApiKey}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.message.includes('API key not valid')) {
                        throw new Error('The provided API key is not valid. Please check it and try again.');
                    }
                    if (errorData.error && errorData.error.message.includes('Quota exceeded')) {
                        throw new Error('The daily analysis quota for this tool has been reached. Please try again tomorrow.');
                    }
                    throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
                }
                const data = await response.json();
                renderSeoResults(resultsContainer, data);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
                renderError(resultsContainer, `Could not analyze site: ${message}`);
            }
        });
    }

    // --- DOMAIN VALUE CALCULATOR ---
    if (domainValueForm) {
        domainValueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(document.getElementById('domain-value-input').value);
            const resultsContainer = document.getElementById('results-container');

            if (!domain) {
                renderError(resultsContainer, 'Please enter a valid domain name.');
                return;
            }
            if (!geminiApiKey) { // Failsafe check
                renderError(resultsContainer, 'The application is not configured with a Gemini API Key.');
                return;
            }
            if (!whoisApiKey) { // Needed for context
                renderError(resultsContainer, 'The application is not configured with a WHOIS API Key.');
                return;
            }

            showLoading(resultsContainer, 'Appraising domain with AI...');

            try {
                // 1. Fetch WHOIS data for context
                const whoisUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${whoisApiKey}&domainName=${domain}&outputFormat=JSON`;
                const whoisResponse = await fetch(whoisUrl);
                const whoisData = await whoisResponse.json();
                const record = whoisData?.WhoisRecord;
                const domainAge = record?.createdDate ?
                    `${((new Date() - new Date(record.createdDate)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} years` :
                    'new';

                // 2. Call Gemini API with context
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                const prompt = `
                    Act as a professional domain name appraiser. I will provide you with a domain name and its age. 
                    Your task is to provide an estimated value in USD and a detailed analysis.

                    Domain: "${domain}"
                    Age: ${domainAge}

                    Analyze the domain based on the following factors:
                    - TLD (Top-Level Domain, e.g., .com, .io, .ai)
                    - Length and memorability
                    - Keyword relevance and commercial intent
                    - Brandability and uniqueness
                    - Age of the domain

                    Provide your response in a valid JSON format according to the schema.
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                estimatedValue: {
                                    type: Type.NUMBER,
                                    description: 'The estimated value of the domain in USD. Provide a single number.'
                                },
                                summary: {
                                    type: Type.STRING,
                                    description: 'A one or two-sentence summary explaining the valuation.'
                                },
                                positiveFactors: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: 'A list of key positive points affecting the value.'
                                },
                                negativeFactors: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: 'A list of key negative points affecting the value.'
                                },
                                valuationConfidence: {
                                    type: Type.STRING,
                                    description: 'Confidence level of the valuation. Must be one of: Low, Medium, High.'
                                },
                                recommendedAction: {
                                    type: Type.STRING,
                                    description: 'A brief recommended action (e.g., "Strong Buy", "Hold for negotiation", "Monitor").'
                                },
                                monetizationStrategies: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: 'A list of 2-3 potential monetization strategies for this domain (e.g., "Affiliate marketing site", "SaaS platform", "Lead generation portal").'
                                }
                            },
                            required: ['estimatedValue', 'summary', 'positiveFactors', 'negativeFactors', 'valuationConfidence', 'recommendedAction', 'monetizationStrategies']
                        }
                    }
                });

                const valuationData = JSON.parse(response.text());
                renderDomainValueResults(resultsContainer, valuationData);

            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                renderError(resultsContainer, `Could not evaluate domain: ${message}`);
            }
        });
    }

    const renderGoogleDnsResults = (container, data) => {
        const recordTypes = { 1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 43: 'DS', 257: 'CAA' };
        if (!data || !data.Answer || data.Answer.length === 0) {
            return renderError(container, 'No DNS records found for this domain.');
        }
        let html = '<div class="space-y-4">';
        const recordsByType = data.Answer.reduce((acc, rec) => {
            const typeName = recordTypes[rec.type] || `Type ${rec.type}`;
            if (!acc[typeName]) {
                acc[typeName] = [];
            }
            acc[typeName].push(rec);
            return acc;
        }, {});

        for (const typeName in recordsByType) {
            html += `<h3 class="text-xl font-bold text-blue-200 mt-4 -mb-2">${typeName} Records</h3>`;
            recordsByType[typeName].forEach(rec => {
                html += `
                    <div class="p-3 bg-white/10 rounded-lg">
                        <div class="flex justify-between items-center">
                          <strong class="text-blue-300 font-semibold">${sanitizeHTML(rec.name)}</strong>
                          <span class="text-xs text-blue-200/60">TTL: ${sanitizeHTML(rec.TTL)}</span>
                        </div>
                        <div class="pl-4 mt-1 text-blue-100/90 break-words">${sanitizeHTML(rec.data)}</div>
                    </div>
                `;
            });
        }

        html += '</div>';
        container.innerHTML = html;
    };

    const renderDataItem = (label, value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return '';
        const displayValue = Array.isArray(value) ? value.join('<br>') : sanitizeHTML(value);
        return `
            <div class="flex flex-col sm:flex-row border-b border-white/10 py-2">
                <dt class="w-full sm:w-1/3 font-semibold text-blue-200/70">${sanitizeHTML(label)}:</dt>
                <dd class="w-full sm:w-2/3 text-blue-100 break-words">${displayValue}</dd> 
            </div>
        `;
    };

    const renderContactBlock = (title, contact) => {
        if (!contact) return '';
        const addressParts = [contact.street, contact.city, contact.state, contact.postalCode, contact.country].filter(Boolean);
        let html = `<h3 class="text-xl font-bold text-blue-200 mt-6 mb-2">${title}</h3><div class="space-y-0">`;
        html += renderDataItem('Name', contact.name);
        html += renderDataItem('Organization', contact.organization);
        if (addressParts.length > 0) {
            html += renderDataItem('Address', addressParts.join(', '));
        }
        html += renderDataItem('Phone', contact.telephone);
        html += renderDataItem('Email', contact.email);
        html += '</div>';
        return html;
    };

    const renderWhoisAndHostingResults = (container, whoisData, hostingData) => {
        const record = whoisData?.WhoisRecord;
        let html = '<div class="space-y-0">';

        if (record && record.createdDate) {
            html += '<h3 class="text-xl font-bold text-blue-200 mb-2">WHOIS Information</h3>';
            html += renderDataItem('Domain', record.domainName);
            html += renderDataItem('Registered On', record.createdDate ? new Date(record.createdDate).toUTCString() : 'N/A');
            html += renderDataItem('Expires On', record.expiresDate ? new Date(record.expiresDate).toUTCString() : 'N/A');
            html += renderDataItem('Updated On', record.updatedDate ? new Date(record.updatedDate).toUTCString() : 'N/A');
            html += renderDataItem('Status', record.status);
            html += renderDataItem('Name Servers', record.nameServers?.hostNames);

            html += '<h3 class="text-xl font-bold text-blue-200 mt-6 mb-2">Registrar Information</h3>';
            html += renderDataItem('Registrar', record.registrarName);
            html += renderDataItem('IANA ID', record.registrarIANAID);
            html += renderDataItem('Abuse Email', record.contactEmail);

            html += renderContactBlock('Registrant Contact', record.registrant);
            html += renderContactBlock('Administrative Contact', record.administrativeContact);
            html += renderContactBlock('Technical Contact', record.technicalContact);
        } else {
            html += '<h3 class="text-xl font-bold text-blue-200 mb-2">WHOIS Information</h3>';
            html += '<p class="text-blue-200/60">No WHOIS record found. The domain might be available.</p>';
        }

        if (hostingData && !hostingData.error) {
            html += '<h3 class="text-xl font-bold text-blue-200 mt-6 mb-2">Hosting Information</h3>';
            html += renderDataItem('IP Address', hostingData.ip);
            html += renderDataItem('Hosting Provider (ISP)', hostingData.org);
            html += renderDataItem('Hostname', hostingData.hostname);
            html += renderDataItem('Location', [hostingData.city, hostingData.region, hostingData.country].filter(Boolean).join(', '));
            html += renderDataItem('Timezone', hostingData.timezone);
        }

        html += '</div>';
        container.innerHTML = html;
    };

    const renderSeoResults = (container, data) => {
        const results = data.lighthouseResult;
        const categories = results.categories;
        const audits = results.audits;
        const screenshot = audits['final-screenshot']?.details?.data;

        const createScoreDonut = (title, score) => {
            const scoreNum = Math.round(score * 100);
            let strokeColor = '#4ade80'; // green-400
            if (scoreNum < 90) strokeColor = '#facc15'; // yellow-400
            if (scoreNum < 50) strokeColor = '#f87171'; // red-400
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (scoreNum / 100) * circumference;

            return `
                <div class="flex flex-col items-center">
                    <div class="relative w-28 h-28">
                        <svg class="w-full h-full" viewBox="0 0 100 100">
                            <circle class="text-white/10" stroke-width="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <circle stroke-width="10" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" stroke="${strokeColor}" fill="transparent" r="45" cx="50" cy="50" transform="rotate(-90 50 50)" />
                        </svg>
                        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold" style="color: ${strokeColor};">${scoreNum}</span>
                    </div>
                    <p class="mt-2 text-sm font-semibold text-blue-200/90">${sanitizeHTML(title)}</p>
                </div>
            `;
        };

        const createVitalsCard = (metricId, title) => {
            const metric = audits[metricId];
            if (!metric) return '';
            const value = metric.displayValue;
            const score = metric.score;
            let colorClass = 'text-green-400';
            if (score < 0.9 && score >= 0.5) colorClass = 'text-yellow-400';
            if (score < 0.5) colorClass = 'text-red-400';
            return `
                <div class="bg-white/5 p-4 rounded-lg">
                    <p class="text-sm text-blue-200/70">${sanitizeHTML(title)}</p>
                    <p class="text-2xl font-bold ${colorClass}">${sanitizeHTML(value)}</p>
                </div>
            `;
        };

        const createIssuesList = (title, auditRefs) => {
            if (!auditRefs || auditRefs.length === 0) return '';
            let itemsHtml = '';
            for (const ref of auditRefs) {
                if (ref.weight > 0 && audits[ref.id] && audits[ref.id].score !== null && audits[ref.id].score < 0.9) {
                    const audit = audits[ref.id];
                    const description = audit.description ? audit.description.replace(/\[Learn more\]\(.*\)/g, '') : '';
                    itemsHtml += `
                        <li class="flex items-start gap-3 p-3 bg-white/5 rounded-md">
                            <svg class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.636-1.21 2.852-1.21 3.488 0l6.237 11.917c.616 1.176-.23 2.65-1.57 2.825H3.592c-1.34-.175-2.186-1.649-1.57-2.825L8.257 3.099zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.008a1 1 0 011 1v2.007a1 1 0 01-1 1h-.008a1 1 0 01-1-1V9z" clip-rule="evenodd" /></svg>
                            <div>
                                <p class="font-semibold text-blue-100">${sanitizeHTML(audit.title)}</p>
                                <p class="text-sm text-blue-200/80">${sanitizeHTML(description)}</p>
                            </div>
                        </li>
                    `;
                }
            }
            if (itemsHtml === '') return `<div><h3 class="text-xl font-bold text-blue-200 mb-3">${title}</h3><p class="text-green-400">✅ No major issues found!</p></div>`;
            return `
                <div>
                    <h3 class="text-xl font-bold text-blue-200 mb-3">${title}</h3>
                    <ul class="space-y-2">${itemsHtml}</ul>
                </div>
            `;
        };

        let html = `
            <div class="space-y-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    ${screenshot ? `
                        <div>
                            <h2 class="text-2xl font-bold text-blue-200 mb-3 text-center lg:text-left">Homepage Screenshot</h2>
                            <img src="${screenshot}" alt="Website Screenshot" class="rounded-lg border-2 border-white/20 mx-auto shadow-lg" />
                        </div>
                    ` : ''}
                    <div class="flex flex-col items-center">
                        <h2 class="text-2xl font-bold text-blue-200 mb-4 text-center">Overall Scores</h2>
                        <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                            ${createScoreDonut('Performance', categories.performance.score)}
                            ${createScoreDonut('Accessibility', categories.accessibility.score)}
                            ${createScoreDonut('Best Practices', categories['best-practices'].score)}
                            ${createScoreDonut('SEO', categories.seo.score)}
                        </div>
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-blue-200 mb-3 text-center">Core Web Vitals</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        ${createVitalsCard('largest-contentful-paint', 'Largest Contentful Paint (LCP)')}
                        ${createVitalsCard('cumulative-layout-shift', 'Cumulative Layout Shift (CLS)')}
                        ${createVitalsCard('total-blocking-time', 'Total Blocking Time (TBT)')}
                    </div>
                </div>
                ${createIssuesList('SEO Opportunities & Issues', categories.seo.auditRefs)}
                ${createIssuesList('Performance Opportunities', categories.performance.auditRefs)}
                ${createIssuesList('Accessibility Issues', categories.accessibility.auditRefs)}
            </div>
        `;
        container.innerHTML = html;
    };


    const renderDomainValueResults = (container, data) => {
        const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.estimatedValue);

        const confidenceClasses = {
            'High': 'bg-green-500/20 text-green-300',
            'Medium': 'bg-yellow-500/20 text-yellow-300',
            'Low': 'bg-red-500/20 text-red-300',
        };
        const confidenceClass = confidenceClasses[data.valuationConfidence] || 'bg-gray-500/20 text-gray-300';

        const factorList = (title, factors, icon) => {
            if (!factors || factors.length === 0) return '';
            return `
                <div>
                    <h4 class="text-lg font-semibold text-blue-200 mb-2 flex items-center gap-2">${icon} ${title}</h4>
                    <ul class="list-none space-y-2 text-blue-200/90 pl-2">
                        ${factors.map(f => `<li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span>${sanitizeHTML(f)}</span></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <p class="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Estimated Value</p>
                    <h2 class="text-5xl font-extrabold my-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-teal-200">${formattedValue}</h2>
                    <div class="inline-flex flex-wrap justify-center items-center gap-4">
                        <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full ${confidenceClass}">${sanitizeHTML(data.valuationConfidence)} Confidence</span>
                         <div class="bg-blue-500/20 text-blue-300 px-3 py-1 text-sm font-semibold rounded-full">
                            <strong>Action:</strong> ${sanitizeHTML(data.recommendedAction)}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-blue-200 mb-2">Valuation Summary</h3>
                    <p class="text-blue-200/90 bg-white/5 p-4 rounded-md">${sanitizeHTML(data.summary)}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${factorList('Positive Factors', data.positiveFactors, '👍')}
                    ${factorList('Negative Factors', data.negativeFactors, '👎')}
                </div>
                
                 <div>
                    <h3 class="text-xl font-bold text-blue-200 mb-2">Monetization Strategies</h3>
                     <div class="flex flex-wrap gap-2">
                         ${data.monetizationStrategies && data.monetizationStrategies.map(s => `
                            <span class="bg-teal-500/20 text-teal-300 px-3 py-1 text-sm font-semibold rounded-full">${sanitizeHTML(s)}</span>
                        `).join('')}
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;
    };
});
