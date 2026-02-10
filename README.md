# World Bestseller Ranking

5개국(한국, 미국, 일본, 영국, 중국) 베스트셀러 도서 순위를 한눈에 확인할 수 있는 웹 서비스입니다.

## Live Demo

- **Web**: https://arslonga1984.github.io/book/
- **API**: https://book-ranking-api.onrender.com/api/v1/health

## Features

- 5개국 베스트셀러 TOP 20 (YES24, Amazon, Dangdang)
- 책 상세 정보 모달 (설명, 순위 히스토리, 구매 링크)
- 4개 언어 지원 (한국어, English, 日本語, 中文)
- 반응형 디자인 (모바일/PC)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML/CSS/JS (GitHub Pages) |
| Backend | Fastify + TypeScript (Render.com) |
| Database | PostgreSQL (Neon.tech) |
| ORM | Prisma |
| Scraping | Cheerio |

## Project Structure

```
book-ranking/
├── apps/
│   ├── api/          # Fastify API server + scrapers
│   └── mobile/       # React Native app + web dist
├── packages/
│   └── shared/       # Shared types
├── docs/             # Documentation
├── index.html        # Web (GitHub Pages)
└── render.yaml       # Render deployment config
```

## API Endpoints

```
GET  /api/v1/books?country=KR|US|JP|UK|CN&limit=20&lang=ko|en|zh|ja
GET  /api/v1/books/:id?lang=ko|en|zh|ja
GET  /api/v1/health
POST /api/v1/scrape
```

## Local Development

```bash
# Install dependencies
pnpm install

# Build shared package
pnpm build:shared

# Generate Prisma client
pnpm db:generate

# Run API server
pnpm dev:api
```

## Environment Variables

```
DATABASE_URL=postgresql://...
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
```
