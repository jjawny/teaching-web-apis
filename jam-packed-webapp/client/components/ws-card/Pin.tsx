import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/client/components/ui/input-otp";
import { cn } from "~/client/utils/cn";

const LARGE_STYLES = "w-16 h-16 text-3xl";

type PinHelperText = {
  error?: string;
  helper?: string;
};

/**
 * Simple PIN component that doesn't reference any stores
 */
export default function Pin({
  pinHelperText,
  value,
  onChange,
  onComplete,
}: {
  pinHelperText?: PinHelperText;
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
}) {
  const hasError = !!pinHelperText?.error;
  const ariaInvalidLabel = hasError ? "true" : "false";
  const hasMounted = useRef<boolean>(false);
  const [isPlayShakeAnimation, setIsPlayShakeAnimation] = useState(false);

  useEffect(
    function completeOnMount() {
      if (value.length === 4 && !hasMounted.current) {
        onComplete(value);
      }
      hasMounted.current = true;
    },
    [value, onComplete],
  );

  useEffect(
    function shakeOnError() {
      if (value.length === 4 && hasError) {
        setIsPlayShakeAnimation(true);

        const timeout = setTimeout(() => {
          setIsPlayShakeAnimation(false);
        }, 300);

        return () => clearTimeout(timeout);
      }
    },
    [value, hasError, setIsPlayShakeAnimation],
  );

  return (
    <div>
      <InputOTP
        maxLength={4}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        autoFocus
      >
        <InputOTPGroup className={cn(isPlayShakeAnimation && "animate-shake", "shadow-sm")}>
          <InputOTPSlot aria-invalid={ariaInvalidLabel} index={0} className={LARGE_STYLES} />
          <InputOTPSlot aria-invalid={ariaInvalidLabel} index={1} className={LARGE_STYLES} />
          <InputOTPSlot aria-invalid={ariaInvalidLabel} index={2} className={LARGE_STYLES} />
          <InputOTPSlot aria-invalid={ariaInvalidLabel} index={3} className={LARGE_STYLES} />
        </InputOTPGroup>
      </InputOTP>
      <HelperText pinHelperText={pinHelperText} />
    </div>
  );
}

function HelperText({ pinHelperText }: { pinHelperText?: PinHelperText }) {
  if (pinHelperText?.error) {
    return <span className="block pt-2 text-center text-red-500">{pinHelperText.error}</span>;
  }

  return (
    <span className="block pt-2 text-center opacity-50">{pinHelperText?.helper ?? "\u200B"}</span>
  );
}
