import z from "zod";

export const CustomJwtSchema = z.object({
  jwt: z.string(),
});

export type CustomJwt = z.infer<typeof CustomJwtSchema>;
