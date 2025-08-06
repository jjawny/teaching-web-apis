export function getExponentialBackoffDelay(
  attempt: number,
  useJitter: boolean = true,
  baseDelayMs = 500,
): number {
  const delay = baseDelayMs * Math.pow(2, attempt) + (useJitter ? Math.random() * 100 : 0);
  console.debug("retrying attempt", attempt, "with delay", delay, "ms");
  return delay;
}
