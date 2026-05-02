import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url(),
});

const env = schema.parse(import.meta.env);

export const API_URL = env.VITE_API_URL;
