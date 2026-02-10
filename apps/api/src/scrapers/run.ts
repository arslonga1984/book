import { runAllScrapers } from './index.js'

console.log('Starting manual scrape...')

runAllScrapers()
  .then(() => {
    console.log('Scrape completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Scrape failed:', error)
    process.exit(1)
  })
