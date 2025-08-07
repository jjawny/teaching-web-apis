import z from "zod";

export const PacerMode = {
  THROTTLE: "throttle",
  DEBOUNCE: "debounce",
} as const;

export const PacerModeSchema = z.enum([PacerMode.THROTTLE, PacerMode.DEBOUNCE]);

export const PacerModeOptions = Object.values(PacerMode) as readonly PacerModeType[];

export type PacerModeType = (typeof PacerMode)[keyof typeof PacerMode];
