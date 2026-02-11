import cron from 'node-cron'
import { runAllScrapers } from '../scrapers/index.js'
import { logEvent } from '../utils/logger.js'

// 주 2회 스크래핑 (화요일, 금요일 오전 6시)
const SCRAPE_SCHEDULE = '0 6 * * 2,5'

export function startCronJobs() {
  logEvent('info', 'cron_jobs_starting', { schedule: SCRAPE_SCHEDULE })

  cron.schedule(SCRAPE_SCHEDULE, async () => {
    const runId = `cron-${Date.now()}`
    const startedAt = Date.now()
    logEvent('info', 'scheduled_scrape_started', { runId })

    try {
      await runAllScrapers()
      logEvent('info', 'scheduled_scrape_completed', {
        runId,
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      logEvent('error', 'scheduled_scrape_failed', {
        runId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  logEvent('info', 'cron_jobs_started', {
    schedule: SCRAPE_SCHEDULE,
    description: 'Tue & Fri at 6:00 AM',
  })
}
