import z from "zod";

export const CheckAuraReqsponseSchema = z.object({
  jobId: z.string(),
  jobStatus: z.string(),
});

export type CheckAuraReqsponse = z.infer<typeof CheckAuraReqsponseSchema>;
