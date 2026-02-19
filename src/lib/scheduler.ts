import { schedule, ScheduledTask } from 'node-cron'

let scheduledTask: ScheduledTask | null = null

export function startDailyDigestScheduler(cronExpression: string = '0 8 * * *') {
  if (scheduledTask) {
    scheduledTask.stop()
  }

  scheduledTask = schedule(cronExpression, async () => {
    console.log(`[${new Date().toISOString()}] Running daily digest...`)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const cronSecret = process.env.CRON_SECRET

      const response = await fetch(`${baseUrl}/api/cron/daily-digest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
      })

      const result = await response.json()
      console.log(`[${new Date().toISOString()}] Daily digest results:`, result)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Daily digest failed:`, error)
    }
  }, {
    timezone: 'Asia/Seoul',
  })

  console.log(`Daily digest scheduler started with expression: ${cronExpression}`)
  return scheduledTask
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('Daily digest scheduler stopped')
  }
}
