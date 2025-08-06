/**
 * Creates a throttled function that only invokes `func` at most once per every `timeFrame` milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  timeFrame: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();
    if (now - lastTime >= timeFrame) {
      func.apply(context, args);
      lastTime = now;
    }
  };
}
