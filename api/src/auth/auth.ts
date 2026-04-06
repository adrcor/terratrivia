import { pool } from "@/database/database";
import { sendResetPasswordEmail } from "@/email";
import { API_URL, APP_URL, BETTER_AUTH_SECRET } from "@/env";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: pool,
  baseURL: API_URL,
  basePath: "/auth",
  secret: BETTER_AUTH_SECRET,
  trustedOrigins: [APP_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const parsed = new URL(url);
      parsed.searchParams.set("callbackURL", APP_URL + "/reset-password");
      await sendResetPasswordEmail({ user, url: parsed.toString() });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30, // 5 minutes
    },
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
