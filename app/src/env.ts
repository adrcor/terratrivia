import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_DEBUG: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((v) => v === "true"),
});

const env = schema.parse(import.meta.env);

export const API_URL = env.VITE_API_URL;
export const DEBUG = env.VITE_DEBUG;
