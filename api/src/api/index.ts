import { withAuth, withDatabase } from "./middlewares";
import { newMiddleware, serve } from "./utils";
import { auth, type Session, type User } from "@/auth";
import { APP_URL, VERSION } from "@/env";
import { getCountries } from "@/modules/geo";
import { getHighscores, getResultById, getResults, postResult } from "@/modules/trial";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ============================================================================
// App
// ============================================================================

const withAuthAndDatabase = (h: Context) =>
  newMiddleware(h).andThen(withAuth).andThen(withDatabase);

function newApi() {
  return (
    new Hono()
      .use(logger())
      .use(
        "*",
        cors({
          origin: APP_URL,
          allowHeaders: ["Content-Type", "Authorization"],
          allowMethods: ["POST", "GET", "OPTIONS"],
          exposeHeaders: ["Content-Length"],
          maxAge: 600,
          credentials: true,
        }),
      )

      .get("/", (h: Context) => {
        return h.text(`terratrivia ${VERSION}`);
      })

      // geo routes
      .get("/geo/countries", (h: Context) => {
        return serve(h, (h) => newMiddleware(h), getCountries);
      })

      // trial routes
      .post("/trial/results", (h: Context) => {
        return serve(h, withAuthAndDatabase, postResult);
      })
      .get("/trial/results", (h: Context) => {
        return serve(h, withAuthAndDatabase, getResults);
      })
      .get("/trial/results/:id", (h: Context) => {
        return serve(h, withAuthAndDatabase, (ctx) =>
          getResultById({ ...ctx, id: h.req.param("id")! }),
        );
      })
      .get("/trial/highscores", (h: Context) => {
        return serve(h, withAuthAndDatabase, getHighscores);
      })

      .on(["POST", "GET"], "/auth/*", (h) => {
        return auth.handler(h.req.raw);
      })
  );
}

// Initialize app with dependencies
const api = newApi();

type ApiType = typeof api & {
  auth: typeof auth;
};

export { api, type ApiType };
export type { User, Session };
