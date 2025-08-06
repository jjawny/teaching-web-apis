"use client";

import { GaugeIcon, TimerIcon } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCheckAuraMutation } from "~/client/hooks/useCheckAuraMutation";
import { useGetJamPackedWebApiTokenQuery } from "~/client/hooks/useGetJamPackedWebApiTokenQuery";
import { useTimelineCtx } from "~/client/hooks/useTimelineCtx";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { debounce } from "~/client/utils/debounce";
import { throttle } from "~/client/utils/throttle";
import { toastError } from "~/client/utils/toast-utils";
import IconSwitch from "./ui/icon-switch";
import ShrinkingInput from "./ui/shrinking-input";

type Mode = "throttle" | "debounce";

export default function MainTextField() {
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
      timeout = setTimeout(() => setIsSuccessful(false), 500);
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
      console.log("here", { roomId, username: val, token });
      checkAuraMutation.mutate({
        roomId,
        username: val,
        token: token.data,
      });
    },
    [roomId, checkAuraMutation, refetchJamPackedWebApiToken],
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
    const nextMode = isChecked ? "debounce" : "throttle";
    if (nextMode !== mode) {
      cancelPending();
      setMode(nextMode);
    }
  };

  const getMutationStatusColor = () => {
    switch (checkAuraMutation.status) {
      case "pending":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "idle":
      default:
        return "bg-gray-500";
    }
  };

  // TODO: local errors and ext/network errors show stacked

  return (
    <>
      <div className="mb-2 flex w-full gap-2">
        <ShrinkingInput
          label="Your Username"
          value={input}
          onChange={handleInputChange}
          containerClassName="grow"
          className="bg-red-500 text-lg"
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
      <p>
        {mode}
        {}
      </p>
      <div className="mb-2">
        <strong>HTTP Status:</strong>{" "}
        {checkAuraMutation.isPending
          ? "loading"
          : checkAuraMutation.isSuccess
            ? "success"
            : checkAuraMutation.isError
              ? "error"
              : "idle"}
        {checkAuraMutation.error && (
          <span className="ml-2 text-red-500">{checkAuraMutation.error.message}</span>
        )}
      </div>
    </>
  );
}
