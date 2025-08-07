"use client";

import { AlertCircle, CheckCircle2, Loader2, PlaneIcon } from "lucide-react";
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
import { PacerModeType } from "../enums/pacer-mode";
import PacerModeRadioGroup from "./PacerModeRadioGroup";
import ShrinkingInput from "./ui/shrinking-input";

const THROTTLE_TIME_MS = 1000;
const DEBOUNCE_TIME_MS = 1000;

export default function CheckAuraInput() {
  const [input, setInput] = useState<string>("");
  const [mode, setMode] = useState<PacerModeType>("throttle");
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [isHoneypotEngaged, setIsHoneypotEngaged] = useState<boolean>(false);

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
    }, DEBOUNCE_TIME_MS),
  );

  // Throttle wrapper
  const throttledTrigger = useMemo(
    () =>
      throttle((val: string) => {
        console.debug("throttle trigger", val);
        triggerMutation(val);
      }, THROTTLE_TIME_MS),
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

    if (isHoneypotEngaged) {
      // Not visible to bots or scrapers
      console.debug("Honeypot filled, skipping mutation");
      return; // Skip processing if honeypot is filled
    }

    if (mode === "debounce") {
      debouncedTriggerRef.current(val);
      return;
    }

    if (mode === "throttle") {
      const now = Date.now();
      if (now - lastThrottleTimeRef.current >= THROTTLE_TIME_MS) {
        throttledTrigger(val);
        lastThrottleTimeRef.current = now;
      } else {
      }

      return;
    }
  };

  const handleModeChange = (nextMode: PacerModeType) => {
    addTick("click");

    if (nextMode !== mode) {
      cancelPending();
      setMode(nextMode);
    }
  };

  const getMutationStatusColor = () => {
    // Separate from checkAuraMutation's success as temporary

    if (isSuccessful) {
      return "border border-lime-500 focus-visible:border-lime-500 focus-visible:ring-lime-500/50";
    }
    switch (checkAuraMutation.status) {
      case "pending":
        return "border border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/50";
      // case "success":
      // return "border border-lime-500 focus-visible:border-lime-500 focus-visible:ring-lime-500/50";
      case "error":
        return "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50";
      case "idle":
      default:
        return "border border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-300/50";
    }
  };

  const getMutationStatusIcon = () => {
    if (isSuccessful) {
      return <CheckCircle2 className="text-lime-500" size={20} />;
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
          inputClassName={cn("text-lg", getMutationStatusColor())}
          icon={getMutationStatusIcon()}
        />
        <HoneypotField onChange={setIsHoneypotEngaged} />
        <PacerModeRadioGroup mode={mode} onModeChange={handleModeChange} className="shrink" />
      </div>
      {checkAuraMutation.error && <p className="text-red-500">{checkAuraMutation.error.message}</p>}
      <ModeHelperText mode={mode} />
    </div>
  );
}

// HoneypotField: visually hidden, but tempting for bots
function HoneypotField({ onChange }: { onChange: (isEngaged: boolean) => void }) {
  const [honeypot, setHoneypot] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHoneypot(val);
    const isEngaged = val.trim().length > 0;
    onChange(isEngaged);
  };

  // Lure with a common field like website (has a high win rate for bots)
  // why not email? name? use a common field unrelated to the domain of the app, so for this app, use website, also unlikey to be autofilled if users are not targeting it w any info
  // use a wrapping absolute div to hide it visually but not tip-off screen readers/bots using accessability like display none or visibility hidden
  // having this absolute still makes it accessible to screen readers for less suspicion, using aria-hidden to not announce it, still present in DOM for bots
  //
  return (
    <div
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <label htmlFor="website" style={{ display: "none" }}>
        Website
      </label>
      <input
        type="text"
        id="website"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        value={honeypot}
        onChange={handleChange}
        placeholder="Your website"
        style={{ opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
      />
    </div>
  );
}

function ModeHelperText({ mode }: { mode: PacerModeType }) {
  const debounceTimeSeconds = DEBOUNCE_TIME_MS / 1000;
  const throttleTimeSeconds = THROTTLE_TIME_MS / 1000;
  return (
    <p className="text-muted-foreground text-sm">
      {mode === "throttle" ? (
        <span className="flex">
          Throttling sends one (<PlaneIcon strokeWidth={1} />) every {throttleTimeSeconds} second
          {throttleTimeSeconds > 1 ? "s" : ""}
        </span>
      ) : (
        <span className="flex">
          Debouncing sends one (<PlaneIcon strokeWidth={1} />) after {debounceTimeSeconds} second
          {debounceTimeSeconds > 1 ? "s" : ""} of inactivity
        </span>
      )}
    </p>
  );
}
