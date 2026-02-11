export function logEvent(
  level: 'info' | 'error',
  event: string,
  data: Record<string, unknown> = {}
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  }

  const message = JSON.stringify(payload)
  if (level === 'error') {
    console.error(message)
    return
  }

  console.log(message)
}
