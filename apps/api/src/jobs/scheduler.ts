import cron from 'node-cron'
import { runAllScrapers } from '../scrapers/index.js'

// 주 2회 스크래핑 (화요일, 금요일 오전 6시)
const SCRAPE_SCHEDULE = '0 6 * * 2,5'

export function startCronJobs() {
  console.log('Starting cron jobs...')

  cron.schedule(SCRAPE_SCHEDULE, async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled scrape...`)

    try {
      await runAllScrapers()
      console.log(`[${new Date().toISOString()}] Scrape completed successfully`)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scrape failed:`, error)
    }
  })

  console.log(`Scraper scheduled: ${SCRAPE_SCHEDULE} (Tue & Fri at 6:00 AM)`)
}
