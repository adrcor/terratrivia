import { z } from "zod";

const schema = z.object({
  DEBUG: z.coerce.boolean().default(false),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  APP_URL: z.string(),
  API_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().default("TerraTrivia <noreply@terratrivia.app>"),
});

const env = schema.parse(process.env);

export const DEBUG = env.DEBUG;
export const PORT = env.PORT;
export const DATABASE_URL = env.DATABASE_URL;
export const APP_URL = env.APP_URL;
export const API_URL = env.API_URL;
export const BETTER_AUTH_SECRET = env.BETTER_AUTH_SECRET;
export const RESEND_API_KEY = env.RESEND_API_KEY;
export const EMAIL_FROM = env.EMAIL_FROM;
export const VERSION = "v1.2.1";
