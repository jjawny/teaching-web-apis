import { useEffect, useState } from "react";

const SHOW_COMPLETED_PERCENTAGE_DURATION_MS = 100;
/**
 * Calculate the loading progress for UI based on a list of loading bools.
 * @param loadingBools list of bools that together indicate a loading progress
 * @returns the display progress
 */
export function useLoadingProgress(loadingBools: boolean[]) {
  const actualProgress = calcLoadingBoolsAsPercentage(loadingBools);
  const [displayProgress, setDisplayProgress] = useState(actualProgress);

  useEffect(() => {
    // For better UX, briefly show a nearly complete state (99%)
    //  rather than jumping from (e.g. 50%) to the content immediately upon 100%
    if (actualProgress === 100) {
      setDisplayProgress(99);
      const timer = setTimeout(() => {
        setDisplayProgress(100);
      }, SHOW_COMPLETED_PERCENTAGE_DURATION_MS);

      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(actualProgress);
    }
  }, [actualProgress]);

  return displayProgress;
}

const calcLoadingBoolsAsPercentage = (loadingBools: boolean[]) => {
  const isCompleteCount = loadingBools.filter((b) => !b).length;
  const percentageComplete = (isCompleteCount / loadingBools.length) * 100;
  return percentageComplete;
};
