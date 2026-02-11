import { runAllScrapers } from './index.js'
import { logEvent } from '../utils/logger.js'

const runId = `manual-${Date.now()}`
const startedAt = Date.now()

logEvent('info', 'manual_scrape_started', { runId })

runAllScrapers()
  .then(() => {
    logEvent('info', 'manual_scrape_completed', {
      runId,
      durationMs: Date.now() - startedAt,
    })
    process.exit(0)
  })
  .catch((error) => {
    logEvent('error', 'manual_scrape_failed', {
      runId,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  })
