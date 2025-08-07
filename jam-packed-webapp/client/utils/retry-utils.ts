export function getExponentialBackoffDelay(
  attempt: number,
  useJitter: boolean = true,
  baseDelayMs = 500,
): number {
  const jitter = useJitter ? Math.random() * 100 : 0;
  const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
  console.debug("retrying attempt", attempt, "with delay", delay, "ms");
  return delay;
}
