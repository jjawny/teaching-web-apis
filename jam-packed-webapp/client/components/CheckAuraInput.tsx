"use client";

import { AlertCircle, CheckCircle2, GaugeIcon, Loader2, TimerIcon } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCheckAuraMutation } from "~/client/hooks/useCheckAuraMutation";
import { useGetJamPackedWebApiTokenQuery } from "~/client/hooks/useGetJamPackedWebApiTokenQuery";
import { useTimelineCtx } from "~/client/hooks/useTimelineCtx";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { cn } from "~/client/utils/cn";
import { debounce } from "~/client/utils/debounce";
import { throttle } from "~/client/utils/throttle";
import { toastError } from "~/client/utils/toast-utils";
import { TIMELINE_BAR_WIDTH_PX } from "~/shared/constants";
import IconSwitch from "./ui/icon-switch";
import ShrinkingInput from "./ui/shrinking-input";

type Mode = "throttle" | "debounce";

export default function CheckAuraInput() {
  const [input, setInput] = useState<string>("");
  const [mode, setMode] = useState<Mode>("throttle");
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

  const roomId = useWsCtx((ctx) => ctx.roomId);
  const addTick = useTimelineCtx((ctx) => ctx.addTick);

  const { refetch: refetchJamPackedWebApiToken, error: tokenError } =
    useGetJamPackedWebApiTokenQuery({ isEnabled: false });
  const checkAuraMutation = useCheckAuraMutation();

  const lastThrottleTimeRef = useRef<number>(0);

  useEffect(() => toastError(tokenError), [tokenError]);
  useEffect(() => toastError(checkAuraMutation.error), [checkAuraMutation.error]);
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (checkAuraMutation.isSuccess) {
      setIsSuccessful(true);
      timeout = setTimeout(() => setIsSuccessful(false), 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [checkAuraMutation.isSuccess]);

  // Wrapped mutation trigger
  const triggerMutation = useCallback(
    async (val: string) => {
      const token = await refetchJamPackedWebApiToken();
      if (!roomId || !token.data) {
        toastError("No room ID or token available, cannot start job");
        return;
      }
      addTick("http");
      console.log("here", { roomId, username: val, token });
      checkAuraMutation.mutate({
        roomId,
        username: val,
        token: token.data,
      });
    },
    [roomId, checkAuraMutation, refetchJamPackedWebApiToken, addTick],
  );
  // Debounce wrapper
  const debouncedTriggerRef = useRef(
    debounce((val: string) => {
      triggerMutation(val);
    }, 1000),
  );

  // Throttle wrapper
  const throttledTrigger = useMemo(
    () =>
      throttle((val: string) => {
        console.debug("throttle trigger", val);
        triggerMutation(val);
      }, 1000),
    [triggerMutation],
  );

  // Cancel any pending debounce/throttle (mode switch)
  const cancelPending = () => {
    debouncedTriggerRef.current.cancel();
    lastThrottleTimeRef.current = 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (mode === "debounce") {
      debouncedTriggerRef.current(val);
      return;
    }

    if (mode === "throttle") {
      const now = Date.now();
      if (now - lastThrottleTimeRef.current >= 1000) {
        throttledTrigger(val);
        lastThrottleTimeRef.current = now;
      } else {
      }

      return;
    }
  };

  const handleModeChange = (isChecked: boolean) => {
    addTick("click");
    const nextMode = isChecked ? "debounce" : "throttle";

    if (nextMode !== mode) {
      cancelPending();
      setMode(nextMode);
    }
  };

  const getMutationStatusColor = () => {
    // Separate from checkAuraMutation's success as temporary

    if (isSuccessful) {
      return "border border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50";
    }
    switch (checkAuraMutation.status) {
      case "pending":
        return "border border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/50";
      // case "success":
      // return "border border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50";
      case "error":
        return "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50";
      case "idle":
      default:
        return "border border-gray-500 focus-visible:border-gray-500 focus-visible:ring-gray-500/50";
    }
  };

  const getMutationStatusIcon = () => {
    if (isSuccessful) {
      return <CheckCircle2 className="text-green-500" size={20} />;
    }
    switch (checkAuraMutation.status) {
      case "pending":
        return <Loader2 className="animate-spin text-yellow-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      case "idle":
      default:
        return null;
    }
  };

  // TODO: local errors and ext/network errors show stacked

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: `${TIMELINE_BAR_WIDTH_PX}px` }}
    >
      <div className="mb-2 flex w-full gap-2">
        <ShrinkingInput
          label="Your Username"
          value={input}
          onChange={handleInputChange}
          containerClassName="grow"
          className={cn("text-lg", getMutationStatusColor())}
          icon={getMutationStatusIcon()}
        />

        <IconSwitch
          isChecked={mode === "debounce"}
          onCheckedChange={handleModeChange}
          leftIcon={<GaugeIcon size={16} aria-hidden="true" />}
          rightIcon={<TimerIcon size={16} aria-hidden="true" />}
          tooltipContent={`Switch to ${mode === "throttle" ? "Throttle" : "Debounce"} mode`}
          tooltipDelay={1000}
          className="shrink"
        />
      </div>
      {checkAuraMutation.error && <p className="text-red-500">{checkAuraMutation.error.message}</p>}
      <ModeHelperText mode={mode} />
    </div>
  );
}

function ModeHelperText({ mode }: { mode: Mode }) {
  return (
    <p className="text-muted-foreground text-sm">
      {mode === "throttle"
        ? "Throttling; sends one (send) every {insert ms as seconds} seconds"
        : "Debouncing, sends one (send icon tick) after {insert ms as seconds} seconds of inactivity"}
    </p>
  );
}
