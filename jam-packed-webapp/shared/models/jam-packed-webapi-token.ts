import z from "zod";

export const JamPackedWebApiJwtSchema = z.object({
  jwt: z.string(),
});

export type JamPackedWebApiJwt = z.infer<typeof JamPackedWebApiJwtSchema>;
