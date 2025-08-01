import z from "zod";

export const WsMessageType = {
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  ERROR: "error",
  BAD_PIN: "bad_pin",
  INCORRECT_PIN: "incorrect_pin",
  CURRENT_USERS: "current_users",
  JOB_RETURNED_FROM_CACHE: "job_returned_from_cache",
  JOB_QUEUED: "job_queued",
  JOB_STARTED: "job_started",
  JOB_RETRY: "job_retry",
  JOB_FAILED: "job_failed",
  JOB_SUCCEEDED: "job_succeeded",
} as const;

export const WsMessageTypeSchema = z.enum([
  WsMessageType.USER_JOINED,
  WsMessageType.USER_LEFT,
  WsMessageType.ERROR,
  WsMessageType.BAD_PIN,
  WsMessageType.INCORRECT_PIN,
  WsMessageType.CURRENT_USERS,
  WsMessageType.JOB_RETURNED_FROM_CACHE,
  WsMessageType.JOB_QUEUED,
  WsMessageType.JOB_STARTED,
  WsMessageType.JOB_RETRY,
  WsMessageType.JOB_FAILED,
  WsMessageType.JOB_SUCCEEDED,
]);

export const WsMessageTypeOptions = Object.values(WsMessageType) as readonly WsMessageTypeType[];

export type WsMessageTypeType = (typeof WsMessageType)[keyof typeof WsMessageType];
