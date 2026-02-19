import { startDailyDigestScheduler } from '../src/lib/scheduler'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config()

console.log('Oh My Stock - Daily Digest Scheduler')
console.log('====================================')
console.log(`Time: ${new Date().toISOString()}`)
console.log(`Timezone: Asia/Seoul`)
console.log(`Schedule: Every day at 08:00 KST`)
console.log('')

// Start the scheduler
startDailyDigestScheduler('0 8 * * *')

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down scheduler...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down scheduler...')
  process.exit(0)
})
