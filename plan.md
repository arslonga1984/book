# Plan: Book Detail Page (SPA Navigation) + Description Fix + Full i18n

## Requirements
1. **Detail Page = SPA page navigation** (not modal popup): clicking a book navigates to a full detail view within the same page, replacing the list view. Back button returns to list.
2. **Fix description not loading**: descriptions are being scraped but likely not making it to the DB due to the scraping selectors or data flow. Investigate and fix.
3. **Language selection translates titles AND author names**: currently the rankings API returns `r.book.authorName` (the raw scraper value) regardless of language. Need to translate book titles and author names when language changes.
4. **Clean HTML tags from KR (YES24) descriptions**: some details contain raw HTML like `<b>...</b>` and should be rendered as plain, readable text.

## Current State Analysis

### Description Issue
- Scrapers now have `fetchYes24Description()`, `fetchAmazonDescription()`, `fetchDangdangDescription()` helpers
- These fetch individual detail pages and parse description via CSS selectors
- The `ScrapedBook.description` field is populated and the DB upsert saves it
- **Likely cause**: Scraping hasn't been re-run since adding the description code, OR the CSS selectors don't match the actual page HTML (sites may use different structures/require JS rendering)
- **Fix approach**: We can't change the external sites, but we can improve the scraper selectors to be more resilient and add `og:description` / `meta[name=description]` as reliable fallbacks. Also ensure the scraper is run after deployment.

### KR Description HTML Exposure
- In YES24 detail pages, descriptions sometimes include inline HTML markup (`<b>`, `<br>`, entities).
- Current flow can persist this raw content and the web UI escapes and displays tags as text, causing poor readability.
- **Fix approach**: sanitize/normalize description before saving to DB (preferred) and add final guard at API response level.
  - Strip tags (`<...>`), decode entities (`&nbsp;`, `&amp;`), collapse repeated whitespace/newlines.
  - Keep line breaks only where semantically needed.
  - Preserve original text meaning while removing presentational markup.

### Author Name Translation
- DB schema: `Book.authorName` is a single string (no localized variants like `authorNameKo`, `authorNameEn`, etc.)
- `Author` model has `name` + `nameOriginal` but no localized name fields either
- Rankings API line 87: `author: r.book.authorName` - always returns the raw scraped name
- **Solution options**:
  - Option A: Add `authorNameKo/En/Zh/Ja` fields to Book schema (DB migration) - heavy
  - Option B: Use client-side transliteration or the existing `Author.name` + `Author.nameOriginal` - limited
  - Option C: Return `authorName` as-is for the ranking list (names are proper nouns), but on the detail page use the `Author.name` field which could be set to a common/international name. Add `detailUrl` to the ranking response so the detail page can show original name alongside translated name.

  **Recommended**: Keep author names as-is (proper nouns are typically not translated - "Haruki Murakami" stays "Haruki Murakami"). BUT display them in the **original script** of the source country. When the user switches language, the `title` should translate (via `titleKo/En/Zh/Ja` DB fields) while the author name is shown as scraped. If the user wants "author name in their script", that's a transliteration task beyond simple i18n and would need a translation API or DB migration. For now, keep author name as-is from the scraper.

### Detail Page (SPA Navigation vs Modal)
- Current: clicking book opens a modal overlay
- Requested: clicking book navigates to a detail page within the SPA (replaces the list view, back button returns)
- **Approach**: Use a simple SPA router based on `history.pushState` / `popstate`:
  - State `list`: shows header + tabs + book grid (current view)
  - State `detail/{bookId}`: shows header + back button + detail content (full page)
  - Transition: animate or instant replace of `#app-content`
  - Back button: `popstate` event returns to list view

## Changes

### 1. `apps/mobile/dist2/index.html` - Major rewrite

**Remove**: Modal overlay, modal CSS, modal JS (`openModal`, `closeModal`, modal HTML elements)

**Add**: SPA Router
```
var currentView = 'list'  // 'list' | 'detail'
var currentBookId = null

function navigate(view, bookId) {
  // push state
  // render appropriate view
}

window.addEventListener('popstate', function() {
  // restore previous view from state
})
```

**Add**: Detail Page View
- Full-page layout (not overlay) with:
  - Back navigation bar at top (left arrow + "Back to list" text)
  - Large cover image (centered or left-aligned)
  - Title (translated via API `lang` param)
  - Author name (as returned by API)
  - Publisher, Price
  - Description section (or placeholder)
  - Rank history section
  - Purchase links section
  - Author info section (if available)
- Language selector remains in header (persists across views)
- Country tabs hidden on detail view

**Modify**: Book card click handler
- Change from `openModal(bookId)` to `navigate('detail', bookId)`

**Modify**: Language change behavior
- If on list view: reload rankings (current behavior)
- If on detail view: re-fetch book detail with new lang param

### 2. Scraper description selectors improvement (3 files)

**`apps/api/src/scrapers/kyobobook.ts`**:
- Current selectors: `.infoWrap_txt`, `.txtContentText`, `#infoset_introduce .infoWrap_txt`
- Add fallback: `#infoset_introduce`, `.infoWrap_txt .txtContentText`, `meta[property="og:description"]`
- Also try: `.Ere_prod_mconts_LS .infoWrap_txt` (YES24 2024+ layout)

**`apps/api/src/scrapers/amazon.ts`**:
- Current selectors: `#bookDescription_feature_div .a-expander-content span`, `noscript`
- Add fallback: `#bookDescription_feature_div`, `#productDescription`, `.book-description`
- Amazon is notoriously hard to scrape (requires JS rendering), so `meta[name="description"]` is the most reliable

**`apps/api/src/scrapers/dangdang.ts`**:
- Current selectors: `.descrip`, `#content .descrip`, `.msg_desc`
- Add fallback: `.product_info .descrip`, `#detail_describe`, `meta[name="description"]`

### 3. Description sanitization pipeline (KR priority)
- Add `sanitizeDescription(raw: string): string` utility and apply it in all scrapers before DB upsert
- Priority target: `apps/api/src/scrapers/kyobobook.ts` (YES24)
- Apply same guard in `amazon.ts`, `dangdang.ts` for consistency
- Add API-level safety net in localized field response path to sanitize legacy records

### 4. No DB migration needed
- Title translation already works via `titleKo/En/Zh/Ja` fields + `getLocalizedField()`
- Author name has no localized DB fields, will display as scraped (proper nouns)
- Description translation works via `descriptionKo/En/Zh/Ja` fields

## Files to Modify
1. `apps/mobile/dist2/index.html` - SPA navigation + detail page + remove modal
2. `apps/api/src/scrapers/kyobobook.ts` - Improve description selectors + sanitize description text
3. `apps/api/src/scrapers/amazon.ts` - Improve description selectors + sanitize description text
4. `apps/api/src/scrapers/dangdang.ts` - Improve description selectors + sanitize description text
5. `apps/api/src/scrapers/utils.ts` (new) - `sanitizeDescription()` shared helper
6. `apps/api/src/routes/books.ts` - API-level sanitize fallback for legacy description rows

## Verification
1. Click book on list → page transitions to detail view (no modal)
2. Click back / browser back → returns to list with scroll position preserved
3. Language change on list → titles reload in selected language
4. Language change on detail → re-fetches detail in selected language
5. Description shows if available, placeholder if null
6. KR example like `이해찬 회고록` no longer exposes raw tags (`<b>...`) in detail response/UI
7. Existing stored rows with HTML tags are cleaned by API fallback sanitizer until rescrape completes
8. Mobile + PC layouts both work
