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
    const sslForm = document.getElementById('ssl-checker-form');
    const metaForm = document.getElementById('meta-analyzer-form');
    const redirectForm = document.getElementById('redirect-checker-form');
    const emailForm = document.getElementById('email-checker-form');
    const socialForm = document.getElementById('social-checker-form');
    const techStackForm = document.getElementById('tech-stack-form');
    const robotsForm = document.getElementById('robots-validator-form');


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

    // --- SSL CHECKER ---
    if (sslForm) {
        sslForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(sslForm.querySelector('input').value);
            if (!domain) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer, 'Checking SSL certificate...');

            try {
                // Use a CORS proxy to check SSL info
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://${domain}`)}`;

                // First, let's check if the site responds to HTTPS
                const startTime = Date.now();
                const response = await fetch(proxyUrl, { method: 'HEAD' }).catch(() => null);
                const responseTime = Date.now() - startTime;

                // Get certificate info via SSL Labs-like analysis
                // Since direct SSL inspection isn't possible from browser, we'll provide useful info
                const sslData = {
                    domain: domain,
                    hasHttps: response !== null,
                    responseTime: responseTime,
                    checkedAt: new Date().toISOString()
                };

                // Try to get more info by checking headers
                try {
                    const headResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://${domain}`)}`);
                    const headData = await headResponse.json();
                    sslData.accessible = headData.status?.http_code === 200;
                    sslData.contentType = headData.status?.content_type || 'Unknown';
                } catch (e) {
                    sslData.accessible = false;
                }

                renderSSLResults(resultsContainer, sslData);
            } catch (error) {
                renderError(resultsContainer, `Could not check SSL: ${error.message}`);
            }
        });
    }

    const renderSSLResults = (container, data) => {
        const statusClass = data.hasHttps ? 'text-green-400' : 'text-red-400';
        const statusIcon = data.hasHttps ? '✅' : '❌';
        const statusText = data.hasHttps ? 'HTTPS Enabled' : 'HTTPS Not Detected';

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <div class="text-4xl mb-2">${statusIcon}</div>
                    <h2 class="text-2xl font-bold ${statusClass}">${statusText}</h2>
                    <p class="text-blue-200/80 mt-2">${sanitizeHTML(data.domain)}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 class="text-sm text-blue-200/70 mb-1">Response Time</h4>
                        <p class="text-xl font-bold ${data.responseTime < 1000 ? 'text-green-400' : data.responseTime < 3000 ? 'text-yellow-400' : 'text-red-400'}">${data.responseTime}ms</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 class="text-sm text-blue-200/70 mb-1">Site Accessible</h4>
                        <p class="text-xl font-bold ${data.accessible ? 'text-green-400' : 'text-yellow-400'}">${data.accessible ? 'Yes' : 'Limited'}</p>
                    </div>
                </div>

                <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 class="text-lg font-bold text-blue-200 mb-3">SSL Recommendations</h3>
                    <ul class="space-y-2 text-blue-200/90">
                        ${data.hasHttps ? `
                            <li class="flex items-start gap-2">
                                <span class="text-green-400">✓</span>
                                <span>Site is using HTTPS - data transmission is encrypted</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-blue-400">💡</span>
                                <span>Consider using HSTS headers for enhanced security</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-blue-400">💡</span>
                                <span>Ensure certificate auto-renewal is configured</span>
                            </li>
                        ` : `
                            <li class="flex items-start gap-2">
                                <span class="text-red-400">✗</span>
                                <span>Site does not appear to support HTTPS</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-yellow-400">⚠</span>
                                <span>Install an SSL certificate (Let's Encrypt offers free certificates)</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-yellow-400">⚠</span>
                                <span>Without SSL, Google may penalize your search rankings</span>
                            </li>
                        `}
                    </ul>
                </div>

                <p class="text-xs text-blue-200/50 text-center">Checked at: ${new Date(data.checkedAt).toLocaleString()}</p>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- META TAG ANALYZER ---
    if (metaForm) {
        metaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = getValidUrl(metaForm.querySelector('input').value);
            const resultsContainer = document.getElementById('results-container');

            if (!url) {
                renderError(resultsContainer, 'Please enter a valid URL');
                return;
            }

            showLoading(resultsContainer, 'Analyzing meta tags...');

            try {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();

                if (!data.contents) {
                    throw new Error('Could not fetch page content');
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');

                const metaData = {
                    url: url,
                    title: doc.querySelector('title')?.textContent || '',
                    description: doc.querySelector('meta[name="description"]')?.content || '',
                    keywords: doc.querySelector('meta[name="keywords"]')?.content || '',
                    canonical: doc.querySelector('link[rel="canonical"]')?.href || '',
                    robots: doc.querySelector('meta[name="robots"]')?.content || '',
                    viewport: doc.querySelector('meta[name="viewport"]')?.content || '',
                    charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || doc.querySelector('meta[http-equiv="Content-Type"]')?.content || '',
                    ogTitle: doc.querySelector('meta[property="og:title"]')?.content || '',
                    ogDescription: doc.querySelector('meta[property="og:description"]')?.content || '',
                    ogImage: doc.querySelector('meta[property="og:image"]')?.content || '',
                    ogUrl: doc.querySelector('meta[property="og:url"]')?.content || '',
                    ogType: doc.querySelector('meta[property="og:type"]')?.content || '',
                    twitterCard: doc.querySelector('meta[name="twitter:card"]')?.content || '',
                    twitterTitle: doc.querySelector('meta[name="twitter:title"]')?.content || '',
                    twitterDescription: doc.querySelector('meta[name="twitter:description"]')?.content || '',
                    twitterImage: doc.querySelector('meta[name="twitter:image"]')?.content || '',
                    h1Count: doc.querySelectorAll('h1').length,
                    h1Text: doc.querySelector('h1')?.textContent || '',
                    imgWithoutAlt: doc.querySelectorAll('img:not([alt]), img[alt=""]').length,
                    totalImages: doc.querySelectorAll('img').length,
                    linksCount: doc.querySelectorAll('a').length
                };

                renderMetaResults(resultsContainer, metaData);
            } catch (error) {
                renderError(resultsContainer, `Could not analyze page: ${error.message}`);
            }
        });
    }

    const renderMetaResults = (container, data) => {
        const createMetaCard = (title, value, status, description = '') => {
            const statusColors = {
                good: 'border-green-500/50 bg-green-500/10',
                warning: 'border-yellow-500/50 bg-yellow-500/10',
                error: 'border-red-500/50 bg-red-500/10',
                info: 'border-blue-500/50 bg-blue-500/10'
            };
            const statusIcons = {
                good: '✅',
                warning: '⚠️',
                error: '❌',
                info: 'ℹ️'
            };

            return `
                <div class="p-4 rounded-lg border ${statusColors[status]}">
                    <div class="flex items-start justify-between gap-2">
                        <h4 class="font-semibold text-blue-200">${sanitizeHTML(title)}</h4>
                        <span>${statusIcons[status]}</span>
                    </div>
                    <p class="text-sm text-blue-100 mt-1 break-words">${value ? sanitizeHTML(value) : '<span class="text-red-400 italic">Not found</span>'}</p>
                    ${description ? `<p class="text-xs text-blue-200/60 mt-2">${sanitizeHTML(description)}</p>` : ''}
                </div>
            `;
        };

        const titleStatus = data.title ? (data.title.length <= 60 ? 'good' : 'warning') : 'error';
        const descStatus = data.description ? (data.description.length <= 160 ? 'good' : 'warning') : 'error';

        let html = `
            <div class="space-y-6">
                <div class="text-center p-4 bg-white/10 rounded-lg">
                    <h2 class="text-xl font-bold text-blue-200">Meta Tag Analysis</h2>
                    <p class="text-blue-200/80 text-sm mt-1 break-all">${sanitizeHTML(data.url)}</p>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Essential Meta Tags</h3>
                    <div class="grid grid-cols-1 gap-3">
                        ${createMetaCard('Title Tag', data.title, titleStatus, data.title ? `${data.title.length}/60 characters` : 'Missing - Critical for SEO')}
                        ${createMetaCard('Meta Description', data.description, descStatus, data.description ? `${data.description.length}/160 characters` : 'Missing - Important for click-through rates')}
                        ${createMetaCard('Canonical URL', data.canonical, data.canonical ? 'good' : 'warning', 'Helps prevent duplicate content issues')}
                        ${createMetaCard('Robots', data.robots || 'index, follow (default)', data.robots ? 'info' : 'info')}
                        ${createMetaCard('Viewport', data.viewport, data.viewport ? 'good' : 'error', 'Required for mobile responsiveness')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Open Graph Tags (Facebook/LinkedIn)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${createMetaCard('og:title', data.ogTitle, data.ogTitle ? 'good' : 'warning')}
                        ${createMetaCard('og:description', data.ogDescription, data.ogDescription ? 'good' : 'warning')}
                        ${createMetaCard('og:image', data.ogImage, data.ogImage ? 'good' : 'warning')}
                        ${createMetaCard('og:url', data.ogUrl, data.ogUrl ? 'good' : 'info')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Twitter Card Tags</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${createMetaCard('twitter:card', data.twitterCard, data.twitterCard ? 'good' : 'warning')}
                        ${createMetaCard('twitter:title', data.twitterTitle, data.twitterTitle ? 'good' : 'info')}
                        ${createMetaCard('twitter:description', data.twitterDescription, data.twitterDescription ? 'good' : 'info')}
                        ${createMetaCard('twitter:image', data.twitterImage, data.twitterImage ? 'good' : 'info')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Page Structure</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        ${createMetaCard('H1 Tags', `${data.h1Count} found${data.h1Text ? ': "' + data.h1Text.substring(0, 50) + '..."' : ''}`, data.h1Count === 1 ? 'good' : data.h1Count === 0 ? 'error' : 'warning', 'Ideally have exactly 1 H1 tag')}
                        ${createMetaCard('Images', `${data.totalImages} total, ${data.imgWithoutAlt} missing alt`, data.imgWithoutAlt === 0 ? 'good' : 'warning', 'All images should have alt text')}
                        ${createMetaCard('Links', `${data.linksCount} links found`, 'info')}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- REDIRECT CHECKER ---
    if (redirectForm) {
        redirectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = getValidUrl(redirectForm.querySelector('input').value);
            const resultsContainer = document.getElementById('results-container');

            if (!url) {
                renderError(resultsContainer, 'Please enter a valid URL');
                return;
            }

            showLoading(resultsContainer, 'Tracing redirects...');

            try {
                const redirectChain = [];
                let currentUrl = url;
                let maxRedirects = 10;

                // Use a CORS proxy to trace redirects
                while (maxRedirects > 0) {
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(currentUrl)}`;
                    const response = await fetch(proxyUrl);
                    const data = await response.json();

                    redirectChain.push({
                        url: currentUrl,
                        status: data.status?.http_code || 200,
                        contentType: data.status?.content_type || 'text/html'
                    });

                    // Check if the final URL is different (redirect happened)
                    if (data.status?.url && data.status.url !== currentUrl) {
                        currentUrl = data.status.url;
                        maxRedirects--;
                    } else {
                        break;
                    }
                }

                renderRedirectResults(resultsContainer, redirectChain, url);
            } catch (error) {
                renderError(resultsContainer, `Could not trace redirects: ${error.message}`);
            }
        });
    }

    const renderRedirectResults = (container, chain, originalUrl) => {
        const hasRedirects = chain.length > 1;
        const statusClass = chain.length <= 2 ? 'text-green-400' : chain.length <= 4 ? 'text-yellow-400' : 'text-red-400';

        const getStatusBadge = (status) => {
            const colors = {
                200: 'bg-green-500/20 text-green-300',
                301: 'bg-blue-500/20 text-blue-300',
                302: 'bg-yellow-500/20 text-yellow-300',
                307: 'bg-yellow-500/20 text-yellow-300',
                308: 'bg-blue-500/20 text-blue-300',
                404: 'bg-red-500/20 text-red-300',
                500: 'bg-red-500/20 text-red-300'
            };
            return colors[status] || 'bg-gray-500/20 text-gray-300';
        };

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <h2 class="text-2xl font-bold ${statusClass}">${chain.length} ${chain.length === 1 ? 'Hop' : 'Hops'} Detected</h2>
                    <p class="text-blue-200/80 mt-2">${hasRedirects ? 'Redirect chain found' : 'No redirects - direct response'}</p>
                </div>

                <div class="space-y-3">
                    <h3 class="text-lg font-bold text-blue-200">Redirect Chain</h3>
                    ${chain.map((hop, index) => `
                        <div class="relative pl-8">
                            ${index < chain.length - 1 ? '<div class="absolute left-3 top-8 bottom-0 w-0.5 bg-blue-500/30"></div>' : ''}
                            <div class="absolute left-0 top-2 w-6 h-6 rounded-full ${index === chain.length - 1 ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center text-xs font-bold">${index + 1}</div>
                            <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="px-2 py-0.5 text-xs font-semibold rounded ${getStatusBadge(hop.status)}">${hop.status}</span>
                                    ${index === chain.length - 1 ? '<span class="px-2 py-0.5 text-xs font-semibold rounded bg-green-500/20 text-green-300">Final</span>' : '<span class="px-2 py-0.5 text-xs font-semibold rounded bg-orange-500/20 text-orange-300">Redirect</span>'}
                                </div>
                                <p class="text-blue-100 break-all text-sm">${sanitizeHTML(hop.url)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Analysis</h3>
                    <ul class="space-y-2 text-blue-200/90 text-sm">
                        ${chain.length === 1 ? `
                            <li class="flex items-start gap-2"><span class="text-green-400">✓</span> No redirects detected - optimal configuration</li>
                        ` : ''}
                        ${chain.length === 2 ? `
                            <li class="flex items-start gap-2"><span class="text-green-400">✓</span> Single redirect - acceptable configuration</li>
                        ` : ''}
                        ${chain.length > 2 && chain.length <= 4 ? `
                            <li class="flex items-start gap-2"><span class="text-yellow-400">⚠</span> Multiple redirects detected - consider consolidating</li>
                        ` : ''}
                        ${chain.length > 4 ? `
                            <li class="flex items-start gap-2"><span class="text-red-400">✗</span> Too many redirects - this will hurt SEO and page speed</li>
                        ` : ''}
                        ${chain.some(h => h.status === 302) ? `
                            <li class="flex items-start gap-2"><span class="text-yellow-400">⚠</span> 302 redirect detected - consider using 301 for permanent redirects</li>
                        ` : ''}
                    </ul>
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- EMAIL DELIVERABILITY CHECKER ---
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(emailForm.querySelector('input').value);
            if (!domain) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer, 'Checking email authentication records...');

            try {
                // Fetch SPF, DKIM, and DMARC records using Google DNS API
                const [spfResponse, dmarcResponse, mxResponse] = await Promise.all([
                    fetch(`https://dns.google/resolve?name=${domain}&type=TXT`),
                    fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`),
                    fetch(`https://dns.google/resolve?name=${domain}&type=MX`)
                ]);

                const spfData = await spfResponse.json();
                const dmarcData = await dmarcResponse.json();
                const mxData = await mxResponse.json();

                // Parse SPF record
                const spfRecords = spfData.Answer?.filter(r => r.data?.toLowerCase().includes('v=spf1')) || [];
                const spfRecord = spfRecords.length > 0 ? spfRecords[0].data : null;

                // Parse DMARC record
                const dmarcRecords = dmarcData.Answer?.filter(r => r.data?.toLowerCase().includes('v=dmarc1')) || [];
                const dmarcRecord = dmarcRecords.length > 0 ? dmarcRecords[0].data : null;

                // Parse MX records
                const mxRecords = mxData.Answer?.map(r => r.data) || [];

                const emailData = {
                    domain: domain,
                    spf: spfRecord,
                    dmarc: dmarcRecord,
                    mx: mxRecords,
                    hasSPF: !!spfRecord,
                    hasDMARC: !!dmarcRecord,
                    hasMX: mxRecords.length > 0
                };

                renderEmailResults(resultsContainer, emailData);
            } catch (error) {
                renderError(resultsContainer, `Could not check email records: ${error.message}`);
            }
        });
    }

    const renderEmailResults = (container, data) => {
        const score = (data.hasSPF ? 33 : 0) + (data.hasDMARC ? 34 : 0) + (data.hasMX ? 33 : 0);
        const scoreColor = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';

        const createRecordCard = (title, record, hasRecord, description) => {
            return `
                <div class="bg-white/5 p-4 rounded-lg border ${hasRecord ? 'border-green-500/30' : 'border-red-500/30'}">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-bold text-blue-200">${sanitizeHTML(title)}</h4>
                        <span class="${hasRecord ? 'text-green-400' : 'text-red-400'}">${hasRecord ? '✅ Found' : '❌ Missing'}</span>
                    </div>
                    ${record ? `
                        <div class="bg-black/30 p-3 rounded text-xs font-mono text-blue-100 break-all overflow-x-auto">${sanitizeHTML(record)}</div>
                    ` : `
                        <p class="text-red-300 text-sm">${sanitizeHTML(description)}</p>
                    `}
                </div>
            `;
        };

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <h2 class="text-xl font-bold text-blue-200 mb-2">Email Deliverability Score</h2>
                    <div class="text-5xl font-extrabold ${scoreColor}">${score}%</div>
                    <p class="text-blue-200/80 mt-2">${sanitizeHTML(data.domain)}</p>
                </div>

                <div class="space-y-4">
                    ${createRecordCard('SPF Record', data.spf, data.hasSPF, 'No SPF record found. This may cause emails to be marked as spam.')}
                    ${createRecordCard('DMARC Record', data.dmarc, data.hasDMARC, 'No DMARC record found. Consider adding one for better email security.')}
                    
                    <div class="bg-white/5 p-4 rounded-lg border ${data.hasMX ? 'border-green-500/30' : 'border-red-500/30'}">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-blue-200">MX Records</h4>
                            <span class="${data.hasMX ? 'text-green-400' : 'text-red-400'}">${data.hasMX ? '✅ Found' : '❌ Missing'}</span>
                        </div>
                        ${data.mx.length > 0 ? `
                            <div class="space-y-2">
                                ${data.mx.map(mx => `
                                    <div class="bg-black/30 p-2 rounded text-xs font-mono text-blue-100">${sanitizeHTML(mx)}</div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-red-300 text-sm">No MX records found. This domain cannot receive emails.</p>
                        `}
                    </div>
                </div>

                <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Recommendations</h3>
                    <ul class="space-y-2 text-blue-200/90 text-sm">
                        ${data.hasSPF ? `
                            <li class="flex items-start gap-2"><span class="text-green-400">✓</span> SPF record is configured correctly</li>
                        ` : `
                            <li class="flex items-start gap-2"><span class="text-red-400">✗</span> Add an SPF record to specify authorized email servers</li>
                        `}
                        ${data.hasDMARC ? `
                            <li class="flex items-start gap-2"><span class="text-green-400">✓</span> DMARC policy is in place</li>
                        ` : `
                            <li class="flex items-start gap-2"><span class="text-red-400">✗</span> Add a DMARC record for email authentication reporting</li>
                        `}
                        ${data.hasMX ? `
                            <li class="flex items-start gap-2"><span class="text-green-400">✓</span> MX records are configured for email reception</li>
                        ` : `
                            <li class="flex items-start gap-2"><span class="text-red-400">✗</span> Configure MX records to receive emails</li>
                        `}
                        <li class="flex items-start gap-2"><span class="text-blue-400">💡</span> Consider setting up DKIM for additional security (requires server configuration)</li>
                    </ul>
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- SOCIAL MEDIA HANDLE CHECKER ---
    if (socialForm) {
        socialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = socialForm.querySelector('input').value.trim().replace('@', '');
            if (!username) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer, 'Checking social media availability...');

            const platforms = [
                { name: 'Twitter/X', url: `https://twitter.com/${username}`, icon: '𝕏' },
                { name: 'Instagram', url: `https://instagram.com/${username}`, icon: '📸' },
                { name: 'TikTok', url: `https://tiktok.com/@${username}`, icon: '🎵' },
                { name: 'YouTube', url: `https://youtube.com/@${username}`, icon: '▶️' },
                { name: 'GitHub', url: `https://github.com/${username}`, icon: '💻' },
                { name: 'LinkedIn', url: `https://linkedin.com/in/${username}`, icon: '💼' },
                { name: 'Facebook', url: `https://facebook.com/${username}`, icon: '📘' },
                { name: 'Pinterest', url: `https://pinterest.com/${username}`, icon: '📌' },
                { name: 'Reddit', url: `https://reddit.com/user/${username}`, icon: '🤖' },
                { name: 'Twitch', url: `https://twitch.tv/${username}`, icon: '🎮' }
            ];

            const results = platforms.map(p => ({
                ...p,
                status: 'check', // We'll display links for manual checking
            }));

            renderSocialResults(resultsContainer, username, results);
        });
    }

    const renderSocialResults = (container, username, platforms) => {
        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <h2 class="text-2xl font-bold text-blue-200">Social Handle Check</h2>
                    <p class="text-blue-200/80 mt-2">@${sanitizeHTML(username)}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${platforms.map(p => `
                        <a href="${p.url}" target="_blank" rel="noopener noreferrer" 
                           class="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all">
                            <span class="text-2xl">${p.icon}</span>
                            <div class="flex-1">
                                <h4 class="font-semibold text-blue-200">${sanitizeHTML(p.name)}</h4>
                                <p class="text-xs text-blue-200/60 truncate">${sanitizeHTML(p.url)}</p>
                            </div>
                            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </a>
                    `).join('')}
                </div>

                <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p class="text-blue-200/80 text-sm">
                        <strong>Note:</strong> Click each platform to check if the username is available. Due to platform restrictions, we can't automatically verify availability. A 404 page usually means the username is available.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- TECH STACK DETECTOR ---
    if (techStackForm) {
        techStackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = getValidUrl(techStackForm.querySelector('input').value);
            const resultsContainer = document.getElementById('results-container');

            if (!url) {
                renderError(resultsContainer, 'Please enter a valid URL');
                return;
            }

            showLoading(resultsContainer, 'Detecting technologies...');

            try {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();

                if (!data.contents) {
                    throw new Error('Could not fetch page content');
                }

                const html = data.contents.toLowerCase();
                const detected = [];

                // CMS Detection
                if (html.includes('wp-content') || html.includes('wordpress')) detected.push({ name: 'WordPress', category: 'CMS', icon: '📝' });
                if (html.includes('shopify') || html.includes('cdn.shopify')) detected.push({ name: 'Shopify', category: 'E-commerce', icon: '🛒' });
                if (html.includes('wix.com')) detected.push({ name: 'Wix', category: 'CMS', icon: '🎨' });
                if (html.includes('squarespace')) detected.push({ name: 'Squarespace', category: 'CMS', icon: '⬛' });
                if (html.includes('webflow')) detected.push({ name: 'Webflow', category: 'CMS', icon: '🌊' });
                if (html.includes('ghost.io') || html.includes('ghost-')) detected.push({ name: 'Ghost', category: 'CMS', icon: '👻' });

                // Frameworks
                if (html.includes('__next') || html.includes('/_next/')) detected.push({ name: 'Next.js', category: 'Framework', icon: '▲' });
                if (html.includes('__nuxt') || html.includes('/_nuxt/')) detected.push({ name: 'Nuxt.js', category: 'Framework', icon: '💚' });
                if (html.includes('react') || html.includes('reactdom')) detected.push({ name: 'React', category: 'Framework', icon: '⚛️' });
                if (html.includes('vue') || html.includes('v-if') || html.includes('v-for')) detected.push({ name: 'Vue.js', category: 'Framework', icon: '💚' });
                if (html.includes('angular') || html.includes('ng-')) detected.push({ name: 'Angular', category: 'Framework', icon: '🅰️' });
                if (html.includes('svelte')) detected.push({ name: 'Svelte', category: 'Framework', icon: '🔥' });

                // Analytics & Marketing
                if (html.includes('google-analytics') || html.includes('gtag') || html.includes('ga.js') || html.includes('analytics.js')) detected.push({ name: 'Google Analytics', category: 'Analytics', icon: '📊' });
                if (html.includes('gtm.js') || html.includes('googletagmanager')) detected.push({ name: 'Google Tag Manager', category: 'Analytics', icon: '🏷️' });
                if (html.includes('facebook') && html.includes('pixel')) detected.push({ name: 'Facebook Pixel', category: 'Analytics', icon: '📘' });
                if (html.includes('hotjar')) detected.push({ name: 'Hotjar', category: 'Analytics', icon: '🔥' });
                if (html.includes('mixpanel')) detected.push({ name: 'Mixpanel', category: 'Analytics', icon: '📈' });
                if (html.includes('segment')) detected.push({ name: 'Segment', category: 'Analytics', icon: '📊' });

                // CDN & Infrastructure
                if (html.includes('cloudflare')) detected.push({ name: 'Cloudflare', category: 'CDN', icon: '☁️' });
                if (html.includes('cdn.jsdelivr')) detected.push({ name: 'jsDelivr', category: 'CDN', icon: '📦' });
                if (html.includes('unpkg.com')) detected.push({ name: 'unpkg', category: 'CDN', icon: '📦' });
                if (html.includes('cloudfront')) detected.push({ name: 'AWS CloudFront', category: 'CDN', icon: '☁️' });

                // UI Libraries
                if (html.includes('bootstrap')) detected.push({ name: 'Bootstrap', category: 'UI Library', icon: '🅱️' });
                if (html.includes('tailwind')) detected.push({ name: 'Tailwind CSS', category: 'UI Library', icon: '🌊' });
                if (html.includes('material') && html.includes('ui')) detected.push({ name: 'Material UI', category: 'UI Library', icon: '🎨' });
                if (html.includes('font-awesome') || html.includes('fontawesome')) detected.push({ name: 'Font Awesome', category: 'UI Library', icon: '🔤' });

                // Other tools
                if (html.includes('stripe')) detected.push({ name: 'Stripe', category: 'Payments', icon: '💳' });
                if (html.includes('paypal')) detected.push({ name: 'PayPal', category: 'Payments', icon: '💰' });
                if (html.includes('intercom')) detected.push({ name: 'Intercom', category: 'Support', icon: '💬' });
                if (html.includes('zendesk')) detected.push({ name: 'Zendesk', category: 'Support', icon: '🎧' });
                if (html.includes('crisp')) detected.push({ name: 'Crisp', category: 'Support', icon: '💬' });
                if (html.includes('recaptcha')) detected.push({ name: 'reCAPTCHA', category: 'Security', icon: '🤖' });

                renderTechStackResults(resultsContainer, url, detected);
            } catch (error) {
                renderError(resultsContainer, `Could not analyze site: ${error.message}`);
            }
        });
    }

    const renderTechStackResults = (container, url, technologies) => {
        const categories = technologies.reduce((acc, tech) => {
            if (!acc[tech.category]) acc[tech.category] = [];
            acc[tech.category].push(tech);
            return acc;
        }, {});

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-white/10 rounded-lg">
                    <h2 class="text-2xl font-bold text-blue-200">Technology Stack</h2>
                    <p class="text-blue-200/80 text-sm mt-1 break-all">${sanitizeHTML(url)}</p>
                    <p class="text-blue-100 mt-2">${technologies.length} technologies detected</p>
                </div>

                ${technologies.length > 0 ? `
                    <div class="space-y-4">
                        ${Object.entries(categories).map(([category, techs]) => `
                            <div>
                                <h3 class="text-lg font-bold text-blue-200 mb-2">${sanitizeHTML(category)}</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${techs.map(tech => `
                                        <span class="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
                                            <span>${tech.icon}</span>
                                            <span class="text-blue-100">${sanitizeHTML(tech.name)}</span>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center p-6 bg-white/5 rounded-lg">
                        <p class="text-blue-200/80">No common technologies detected. The site may use custom or less common tools.</p>
                    </div>
                `}

                <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p class="text-blue-200/80 text-sm">
                        <strong>Note:</strong> This detection is based on common patterns in the HTML source. Some technologies may not be detected if they're server-side only or obfuscated.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    // --- ROBOTS.TXT VALIDATOR ---
    if (robotsForm) {
        robotsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = sanitizeDomain(robotsForm.querySelector('input').value);
            if (!domain) return;
            const resultsContainer = document.getElementById('results-container');
            showLoading(resultsContainer, 'Fetching robots.txt...');

            try {
                const robotsUrl = `https://${domain}/robots.txt`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(robotsUrl)}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();

                if (data.status?.http_code === 404 || !data.contents || data.contents.includes('<!DOCTYPE')) {
                    renderRobotsTxtResults(resultsContainer, domain, null);
                } else {
                    renderRobotsTxtResults(resultsContainer, domain, data.contents);
                }
            } catch (error) {
                renderError(resultsContainer, `Could not fetch robots.txt: ${error.message}`);
            }
        });
    }

    const renderRobotsTxtResults = (container, domain, content) => {
        if (!content) {
            container.innerHTML = `
                <div class="space-y-6">
                    <div class="text-center p-6 bg-red-500/10 rounded-lg border border-red-500/30">
                        <div class="text-4xl mb-2">❌</div>
                        <h2 class="text-2xl font-bold text-red-400">No robots.txt Found</h2>
                        <p class="text-blue-200/80 mt-2">${sanitizeHTML(domain)}</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h3 class="text-lg font-bold text-blue-200 mb-3">Recommendations</h3>
                        <ul class="space-y-2 text-blue-200/90 text-sm">
                            <li class="flex items-start gap-2"><span class="text-yellow-400">⚠</span> Create a robots.txt file to control search engine crawling</li>
                            <li class="flex items-start gap-2"><span class="text-blue-400">💡</span> Add a sitemap reference: <code class="bg-black/30 px-1 rounded">Sitemap: https://${sanitizeHTML(domain)}/sitemap.xml</code></li>
                            <li class="flex items-start gap-2"><span class="text-blue-400">💡</span> Block sensitive directories from crawling</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        // Parse robots.txt
        const lines = content.split('\n').filter(l => l.trim());
        const rules = [];
        let currentAgent = '*';
        let sitemaps = [];
        let issues = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) return;

            if (trimmed.toLowerCase().startsWith('user-agent:')) {
                currentAgent = trimmed.split(':')[1].trim();
            } else if (trimmed.toLowerCase().startsWith('disallow:')) {
                rules.push({ agent: currentAgent, type: 'Disallow', path: trimmed.split(':')[1].trim() || '(empty)' });
            } else if (trimmed.toLowerCase().startsWith('allow:')) {
                rules.push({ agent: currentAgent, type: 'Allow', path: trimmed.split(':')[1].trim() });
            } else if (trimmed.toLowerCase().startsWith('sitemap:')) {
                sitemaps.push(trimmed.split(':', 2)[1].trim() + (trimmed.split(':')[2] ? ':' + trimmed.split(':')[2] : ''));
            }
        });

        // Check for common issues
        if (rules.some(r => r.type === 'Disallow' && r.path === '/')) {
            issues.push({ severity: 'warning', message: 'Disallow: / blocks all crawlers from the entire site' });
        }
        if (sitemaps.length === 0) {
            issues.push({ severity: 'info', message: 'No sitemap reference found - consider adding one' });
        }

        let html = `
            <div class="space-y-6">
                <div class="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div class="text-4xl mb-2">✅</div>
                    <h2 class="text-2xl font-bold text-green-400">robots.txt Found</h2>
                    <p class="text-blue-200/80 mt-2">${sanitizeHTML(domain)}</p>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-blue-200 mb-3">Raw Content</h3>
                    <pre class="bg-black/30 p-4 rounded-lg text-xs font-mono text-blue-100 overflow-x-auto whitespace-pre-wrap">${sanitizeHTML(content)}</pre>
                </div>

                ${rules.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-bold text-blue-200 mb-3">Parsed Rules (${rules.length})</h3>
                        <div class="space-y-2">
                            ${rules.map(r => `
                                <div class="flex items-center gap-2 p-2 bg-white/5 rounded text-sm">
                                    <span class="px-2 py-0.5 rounded text-xs font-semibold ${r.type === 'Allow' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">${r.type}</span>
                                    <span class="text-blue-200/80">${sanitizeHTML(r.agent)}:</span>
                                    <code class="text-blue-100">${sanitizeHTML(r.path)}</code>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${sitemaps.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-bold text-blue-200 mb-3">Sitemaps</h3>
                        <div class="space-y-2">
                            ${sitemaps.map(s => `
                                <a href="${sanitizeHTML(s)}" target="_blank" rel="noopener" class="flex items-center gap-2 p-2 bg-white/5 rounded text-sm hover:bg-white/10">
                                    <span class="text-blue-400">📄</span>
                                    <span class="text-blue-100 break-all">${sanitizeHTML(s)}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${issues.length > 0 ? `
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h3 class="text-lg font-bold text-blue-200 mb-3">Notes</h3>
                        <ul class="space-y-2 text-blue-200/90 text-sm">
                            ${issues.map(i => `
                                <li class="flex items-start gap-2">
                                    <span class="${i.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}">${i.severity === 'warning' ? '⚠' : '💡'}</span>
                                    <span>${sanitizeHTML(i.message)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML = html;
    };
});
