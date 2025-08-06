/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * If `immediate` is true, trigger the function on the leading edge, instead of the trailing.
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  function debounced(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    if (timeout) {
      console.debug("Debounce cancelled");
      clearTimeout(timeout);
    }
    if (immediate && !timeout) func.apply(context, args);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
  }

  // Access for external cancellation
  debounced.cancel = () => {
    if (timeout) {
      console.debug("Debounce cancelled externally");
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
