# World Bestseller Ranking App

## 1. Project Overview

### 1.1 Purpose
5 countries (Korea, Japan, China, US, UK) bestseller book rankings in one place.
Mobile app + Web version available.

### 1.2 Core Features
- TOP 20 bestsellers per country
- Book detail info with description
- Purchase links to original bookstores
- 4 language support (Korean, English, Chinese, Japanese)
- Remote scraping trigger via API

---

## 2. Tech Stack

### 2.1 Frontend (Web)
| Category | Technology | Note |
|----------|-----------|------|
| Type | Static HTML/CSS/JS | Single file, GitHub Pages hosted |
| i18n | Custom dictionary | 4 languages (ko/en/ja/zh) |
| Detail | Slide-up modal | API-driven book detail |

### 2.2 Frontend (Mobile)
| Category | Technology | Note |
|----------|-----------|------|
| Framework | React Native | Cross-platform |
| State | Zustand | Lightweight state management |
| Navigation | React Navigation | Standard navigation |
| Styling | NativeWind (Tailwind) | Rapid UI development |
| i18n | i18next | Proven i18n library |

### 2.3 Backend
| Category | Technology | Note |
|----------|-----------|------|
| Runtime | Node.js + TypeScript | Type safety |
| Framework | Fastify | High-performance API |
| Scraping | Cheerio | Static page parsing |
| Database | PostgreSQL (Neon.tech) | Free tier, serverless |
| ORM | Prisma | Type-safe DB access |
| Hosting | Render.com | Free tier web service |

---

## 3. Data Sources

| Country | Bookstore | URL | Scraper |
|---------|-----------|-----|---------|
| KR | YES24 | yes24.com | kyobobook.ts |
| JP | Amazon Japan | amazon.co.jp | amazon.ts |
| CN | Dangdang | dangdang.com | dangdang.ts |
| US | Amazon US | amazon.com | amazon.ts |
| UK | Amazon UK | amazon.co.uk | amazon.ts |

### Collected Fields
- rank, title, author, publisher, price, currency
- coverImageUrl, detailUrl, isbn
- description (from detail page)

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│  Web (GitHub Pages)     Mobile (React Native)       │
│  index.html             apps/mobile/                │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────┐
│            API Server (Render.com)                   │
│            Fastify + TypeScript                      │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ GET /books   │  │ GET /     │  │ POST /scrape │ │
│  │ GET /books/  │  │   health  │  │              │ │
│  │   :id        │  │           │  │              │ │
│  └──────────────┘  └───────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
┌──────────────┐ ┌─────────┐ ┌──────────────────────┐
│ PostgreSQL   │ │Scrapers │ │ External Bookstores  │
│ (Neon.tech)  │ │(Cheerio)│ │ YES24, Amazon,       │
│              │ │         │ │ Dangdang             │
└──────────────┘ └─────────┘ └──────────────────────┘
```

---

## 5. Database Schema (Prisma)

### Models
- **Country** - 5 countries with localized names, bookstore info, flag
- **Author** - Author info with localized bios
- **Book** - Book data with localized titles/descriptions, linked to Country & Author
- **Ranking** - Historical rank data per book per date
- **ScrapeLog** - Scraping execution logs

### Key Relationships
```
Country 1──N Book 1──N Ranking
Author  1──N Book
```

---

## 6. API Endpoints

### Books
```
GET  /api/v1/books?country=KR|JP|CN|US|UK&limit=20&lang=ko|en|zh|ja
GET  /api/v1/books/:id?lang=ko|en|zh|ja
```

### Health & Scraping
```
GET  /api/v1/health
POST /api/v1/scrape
```

---

## 7. Deployment

### Live URLs
| Service | URL | Platform |
|---------|-----|----------|
| Web (Frontend) | https://arslonga1984.github.io/book/ | GitHub Pages |
| API (Backend) | https://book-ranking-api.onrender.com | Render.com |
| Database | Neon.tech PostgreSQL | Neon.tech |
| Source Code | https://github.com/arslonga1984/book | GitHub |

### Notes
- Render free tier sleeps after 15 min inactivity (30-60s cold start)
- Scraping is triggered manually via `POST /api/v1/scrape`
- GitHub Pages serves from root `/` folder

---

## 8. Project Structure

```
book-ranking/
├── apps/
│   ├── api/                     # Backend API server
│   │   ├── src/
│   │   │   ├── routes/          # API routes (books, health)
│   │   │   ├── scrapers/        # Web scrapers (kyobobook, amazon, dangdang)
│   │   │   ├── db/              # Prisma client
│   │   │   └── index.ts         # Server entry point
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── seed.ts          # Seed data (countries)
│   │
│   └── mobile/                  # React Native app
│       ├── src/                 # App source code
│       └── dist2/
│           └── index.html       # Web version (shared)
│
├── packages/
│   └── shared/                  # Shared types (CountryCode, etc.)
│
├── docs/                        # Documentation
│   ├── 01-plan/                 # This plan
│   └── 03-analysis/             # Gap analysis reports
│
├── index.html                   # Web version (GitHub Pages root)
└── render.yaml                  # Render.com deployment config
```

---

## 9. Implementation Status

### Completed
- [x] Monorepo setup (pnpm workspaces)
- [x] Prisma schema (PostgreSQL)
- [x] Fastify API server with CORS
- [x] Scrapers: YES24 (KR), Amazon (US/JP/UK), Dangdang (CN)
- [x] Description scraping from detail pages
- [x] Book listing API with country filter & i18n
- [x] Book detail API with rank history & purchase links
- [x] Web page: country tabs, book cards, responsive design
- [x] Web page: detail modal (slide-up)
- [x] Web page: 4-language i18n system
- [x] GitHub Pages deployment (frontend)
- [x] Render.com deployment (backend API)
- [x] Neon.tech PostgreSQL (database)
- [x] Remote scraping trigger endpoint
- [x] 45 unit tests passing

### Not Yet Implemented
- [ ] Mobile app (React Native) build & publish
- [ ] Scheduled scraping (cron job)
- [ ] AdMob ad integration
- [ ] Push notifications
- [ ] Translation API integration (Google/DeepL)
- [ ] Redis caching

---

**Created**: 2026-02-09
**Updated**: 2026-02-10
**Version**: 2.0
**Status**: MVP Deployed
