# 세계 베스트셀러 앱 구현 계획

## 1. 프로젝트 개요

### 1.1 목적
5개국(한국, 일본, 중국, 미국, 영국)의 베스트셀러 도서 순위를 한 곳에서 확인할 수 있는 iOS 모바일 앱

### 1.2 핵심 요구사항
- 각 국가별 베스트셀러 TOP 20 표시
- 도서 상세 정보 및 작가 정보 제공
- 구매 링크 연동
- 4개 언어 지원 (한국어, 영어, 중국어, 일본어)
- 주 2회 데이터 업데이트
- 광고 기반 수익 모델

---

## 2. 기술 스택

### 2.1 프론트엔드 (모바일)
| 구분 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | React Native | 크로스플랫폼 가능, 넓은 생태계 |
| 상태관리 | Zustand | 가볍고 간단한 상태 관리 |
| 네비게이션 | React Navigation | 표준 네비게이션 라이브러리 |
| 스타일링 | NativeWind (Tailwind) | 빠른 UI 개발 |
| 다국어 | i18next | 검증된 다국어 지원 |
| 광고 | Google AdMob | iOS 광고 표준 |

### 2.2 백엔드
| 구분 | 기술 | 이유 |
|------|------|------|
| 런타임 | Node.js + TypeScript | 타입 안정성, 생태계 |
| 프레임워크 | Fastify | 고성능 API 서버 |
| 스크래핑 | Puppeteer / Cheerio | 동적/정적 페이지 대응 |
| 스케줄러 | node-cron | 주 2회 업데이트 자동화 |
| 데이터베이스 | PostgreSQL | 관계형 데이터, 안정성 |
| 캐싱 | Redis | 빠른 응답, 부하 분산 |

### 2.3 인프라
| 구분 | 기술 | 이유 |
|------|------|------|
| 클라우드 | AWS / Vercel | 확장성, 안정성 |
| CDN | CloudFront | 이미지 캐싱 |
| 모니터링 | Sentry | 에러 추적 |

---

## 3. 데이터 소스 (국가별 온라인 서점)

### 3.1 국가별 주요 서점

| 국가 | 서점 | URL | 비고 |
|------|------|-----|------|
| 🇰🇷 한국 | 교보문고 | kyobobook.co.kr | 국내 1위 온라인 서점 |
| 🇯🇵 일본 | Amazon Japan | amazon.co.jp | 일본 최대 온라인 서점 |
| 🇨🇳 중국 | 当当网 (Dangdang) | dangdang.com | 중국 도서 전문 1위 |
| 🇺🇸 미국 | Amazon US | amazon.com | 미국 최대 온라인 서점 |
| 🇬🇧 영국 | Amazon UK | amazon.co.uk | 영국 최대 온라인 서점 |

### 3.2 수집 데이터 항목
```
- 순위 (rank)
- 책 제목 (title)
- 저자 (author)
- 출판사 (publisher)
- 가격 (price)
- 표지 이미지 URL (coverImageUrl)
- 책 상세 페이지 URL (detailUrl)
- ISBN (isbn)
- 책 소개 (description)
- 카테고리 (category)
```

---

## 4. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        iOS App (React Native)               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │ 홈화면  │  │ 국가별  │  │ 상세    │  │ 설정(언어/알림) ││
│  │(전체순위)│  │ 순위    │  │ 페이지  │  │                 ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Server (Fastify)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ /api/books   │  │ /api/authors │  │ /api/translations│  │
│  │  - GET /     │  │  - GET /:id  │  │  - POST /        │  │
│  │  - GET /:id  │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis       │  │   Scraper       │
│   (도서 데이터) │  │   (캐싱)        │  │   (Cron Job)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                                                  │
                                                  ▼
                           ┌──────────────────────────────────┐
                           │     외부 서점 웹사이트           │
                           │  (교보, Amazon, 당당 등)         │
                           └──────────────────────────────────┘
```

---

## 5. 주요 기능 상세

### 5.1 홈 화면
- 5개국 베스트셀러 통합 미리보기 (각 5권씩)
- 국가 필터 탭
- 검색 기능
- 새로고침 (Pull-to-refresh)

### 5.2 국가별 순위 화면
- 해당 국가 TOP 20 리스트
- 카드형/리스트형 뷰 전환
- 무한 스크롤 (추후 확장 시)

### 5.3 도서 상세 화면
- 표지 이미지 (확대 가능)
- 제목, 저자, 출판사, 가격
- 책 소개 (원문 + 번역)
- 저자 정보 섹션
- "구매하기" 버튼 → 외부 서점 이동
- 공유 기능

### 5.4 다국어 지원
- 앱 UI 언어 선택 (한/영/중/일)
- 책 정보 자동 번역 (Google Translate API 또는 DeepL)
- 원문 보기/번역 보기 토글

### 5.5 알림 기능
- 주 2회 베스트셀러 업데이트 알림
- 특정 저자 신간 알림 (선택)

---

## 6. 웹 스크래핑 관련 법적 고려사항

### ⚠️ 중요 경고
웹 스크래핑은 법적 리스크가 있습니다. 각 사이트별 대응 필요:

### 6.1 법적 리스크
| 리스크 | 설명 | 대응 |
|--------|------|------|
| robots.txt 위반 | 크롤링 금지 영역 접근 | robots.txt 준수 필수 |
| 이용약관 위반 | 서비스 약관 위반 가능 | 약관 검토 필수 |
| 저작권 침해 | 콘텐츠 무단 복제 | 최소한의 정보만 수집 |
| 서버 부하 | 과도한 요청으로 인한 피해 | 요청 간격 조절 (3-5초) |

### 6.2 권장 대응 방안
1. **robots.txt 엄격 준수**
2. **요청 빈도 제한** (분당 10회 이하)
3. **User-Agent 명시** (봇임을 밝힘)
4. **캐싱 적극 활용** (불필요한 재요청 방지)
5. **상업적 이용 시 파트너십 검토**

### 6.3 대안 검토
- Amazon Product Advertising API (제휴 필요)
- 교보문고 제휴 API (문의 필요)
- 도서 정보 오픈 API (ISBN 기반)

---

## 7. 데이터베이스 스키마 (초안)

### 7.1 주요 테이블

```sql
-- 국가
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(2) NOT NULL,  -- KR, JP, CN, US, UK
  name_ko VARCHAR(50),
  name_en VARCHAR(50),
  name_zh VARCHAR(50),
  name_ja VARCHAR(50),
  bookstore_name VARCHAR(100),
  bookstore_url VARCHAR(255)
);

-- 도서
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  country_id INTEGER REFERENCES countries(id),
  isbn VARCHAR(20),
  title VARCHAR(500) NOT NULL,
  title_translated JSONB,  -- {"ko": "", "en": "", "zh": "", "ja": ""}
  author VARCHAR(255),
  publisher VARCHAR(255),
  price VARCHAR(50),
  cover_image_url TEXT,
  detail_url TEXT,
  description TEXT,
  description_translated JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 베스트셀러 순위 (히스토리)
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  country_id INTEGER REFERENCES countries(id),
  rank INTEGER NOT NULL,
  ranking_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 저자
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_original VARCHAR(255),
  bio TEXT,
  bio_translated JSONB,
  image_url TEXT
);
```

---

## 8. API 엔드포인트 설계

### 8.1 도서 API
```
GET  /api/v1/books
     ?country=KR|JP|CN|US|UK
     &limit=20
     &lang=ko|en|zh|ja

GET  /api/v1/books/:id
     ?lang=ko|en|zh|ja

GET  /api/v1/books/:id/purchase-links
```

### 8.2 저자 API
```
GET  /api/v1/authors/:id
     ?lang=ko|en|zh|ja
```

### 8.3 순위 API
```
GET  /api/v1/rankings
     ?country=KR|JP|CN|US|UK
     &date=2024-01-15

GET  /api/v1/rankings/history/:bookId
```

---

## 9. 구현 단계 (Phase)

### Phase 1: 기초 설정 (Schema & Convention)
- [ ] 프로젝트 초기화 (React Native + 백엔드)
- [ ] 데이터베이스 스키마 구현
- [ ] 코딩 컨벤션 정의
- [ ] Git 저장소 설정

### Phase 2: 백엔드 핵심 (API)
- [ ] Fastify 서버 셋업
- [ ] 데이터베이스 연결 (PostgreSQL)
- [ ] 기본 CRUD API 구현
- [ ] 스크래퍼 구현 (1개국 먼저)
- [ ] 스크래퍼 확장 (5개국 전체)
- [ ] Cron Job 설정 (주 2회)

### Phase 3: 번역 시스템
- [ ] 번역 API 연동 (Google/DeepL)
- [ ] 번역 캐싱 로직
- [ ] 다국어 응답 처리

### Phase 4: 모바일 앱 기초 (UI)
- [ ] React Native 프로젝트 셋업
- [ ] 네비게이션 구조
- [ ] 디자인 시스템 구축
- [ ] 다국어(i18n) 설정

### Phase 5: 모바일 앱 기능 구현
- [ ] 홈 화면 구현
- [ ] 국가별 순위 화면
- [ ] 도서 상세 화면
- [ ] 설정 화면 (언어 변경)
- [ ] 외부 구매 링크 연동

### Phase 6: 광고 연동
- [ ] AdMob 설정
- [ ] 배너 광고 삽입
- [ ] 전면 광고 (선택적)

### Phase 7: 테스트 & 배포
- [ ] API 테스트 (단위/통합)
- [ ] 앱 테스트 (E2E)
- [ ] App Store 제출 준비
- [ ] 배포

---

## 10. 디렉토리 구조 (예정)

```
book-ranking/
├── apps/
│   ├── mobile/                 # React Native iOS 앱
│   │   ├── src/
│   │   │   ├── screens/        # 화면 컴포넌트
│   │   │   ├── components/     # 재사용 컴포넌트
│   │   │   ├── hooks/          # 커스텀 훅
│   │   │   ├── stores/         # Zustand 스토어
│   │   │   ├── services/       # API 호출
│   │   │   ├── i18n/           # 다국어 번역
│   │   │   └── utils/          # 유틸리티
│   │   └── ios/                # iOS 네이티브
│   │
│   └── api/                    # 백엔드 서버
│       ├── src/
│       │   ├── routes/         # API 라우트
│       │   ├── services/       # 비즈니스 로직
│       │   ├── scrapers/       # 웹 스크래퍼
│       │   ├── jobs/           # Cron 작업
│       │   └── db/             # 데이터베이스
│       └── prisma/             # Prisma 스키마
│
├── packages/
│   └── shared/                 # 공유 타입/유틸
│
├── docs/                       # 문서
│   ├── 01-plan/
│   └── 02-design/
│
└── docker-compose.yml          # 로컬 개발 환경
```

---

## 11. 리스크 및 대응 방안

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 스크래핑 차단 | 높음 | IP 로테이션, 요청 간격 조절, 대체 API 검토 |
| 사이트 구조 변경 | 높음 | 모니터링 알림, 모듈화된 스크래퍼 |
| 번역 비용 증가 | 중간 | 번역 캐싱, 필요시만 번역 |
| App Store 리젝 | 중간 | 가이드라인 사전 검토, 테스트 철저 |
| 저작권 문제 | 높음 | 최소 정보만 수집, 법적 검토 |

---

## 12. 다음 단계

1. **이 계획 승인 후** → Design 문서 작성 (화면 설계, API 상세 설계)
2. **법적 검토** → 웹 스크래핑 관련 법적 자문 권장
3. **파트너십 검토** → 가능하면 서점과 공식 제휴 추진

---

**작성일**: 2026-02-09
**버전**: 1.0
**상태**: 검토 대기
