<div align="center">

# 🌐 FindAName.live

### AI-Powered Domain Research & SEO Analysis Platform

[![Live Demo](https://img.shields.io/badge/Live-findaname.live-blue?style=for-the-badge)](https://findaname.live)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## 🚀 Overview

**FindAName** is a comprehensive, all-in-one platform for domain investors, SEO professionals, webmasters, and entrepreneurs. It provides **15+ free AI-powered tools** to research domains, analyze SEO metrics, and make data-driven decisions.

## ✨ Features

### 🔧 Domain Research Tools
| Tool | Description |
|------|-------------|
| **AI Domain Generator** | Generate brandable domain names using Google Gemini AI |
| **Domain Value Calculator** | AI-driven price estimation based on market trends |
| **WHOIS Lookup** | Complete domain ownership and registration history |
| **DNS Lookup** | Query A, AAAA, MX, TXT, NS, CNAME, SOA records |
| **Nameserver Lookup** | Identify DNS providers and nameserver configuration |
| **Hosting Lookup** | Detect hosting provider, IP location, and ISP |

### 📊 SEO Analysis Tools
| Tool | Description |
|------|-------------|
| **SEO Score Checker** | Comprehensive technical SEO audit with actionable insights |
| **Authority Score** | Domain authority and competitive positioning analysis |
| **Meta Tag Analyzer** | Analyze title, description, Open Graph, Twitter Cards |
| **Robots.txt Validator** | Parse and validate robots.txt directives |

### 🔒 Security & Technical Tools
| Tool | Description |
|------|-------------|
| **SSL Certificate Checker** | Validate SSL certificates, expiry dates, and grades |
| **Redirect Checker** | Trace HTTP redirect chains and status codes |
| **Email Deliverability** | Check MX, SPF, DMARC, and DKIM records |
| **Tech Stack Detector** | Identify CMS, frameworks, analytics, and CDNs |
| **Social Handle Checker** | Check username availability across 10+ platforms |

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API
- **Authentication:** Google OAuth
- **Payments:** PayPal SDK
- **APIs:** Google DNS API, PageSpeed Insights, ip-api

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SamAdly2023/findaname-live.git
   cd findaname-live
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env.local` file:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Live Demo

Visit **[findaname.live](https://findaname.live)** to try all tools for free!

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── DomainGeneratorTool.tsx
│   │   ├── DomainValueCalculator.tsx
│   │   ├── SeoScoreTool.tsx
│   │   ├── SslCheckerTool.tsx
│   │   ├── MetaAnalyzerTool.tsx
│   │   └── ... (15+ tool components)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── ClientDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   └── services/
│       └── geminiService.ts
├── public/
│   ├── blog/                # SEO blog posts
│   └── sitemap.xml
└── index.html
```

## 🔑 API Keys Required

| Service | Purpose | Get Key |
|---------|---------|---------|
| Google Gemini | AI domain generation & valuation | [Google AI Studio](https://aistudio.google.com) |
| Google OAuth | User authentication | [Google Cloud Console](https://console.cloud.google.com) |
| PayPal | Payment processing | [PayPal Developer](https://developer.paypal.com) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sam Adly** - [@SamAdly2023](https://github.com/SamAdly2023)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/SamAdly2023/findaname-live/issues) · [Request Feature](https://github.com/SamAdly2023/findaname-live/issues)

</div>
