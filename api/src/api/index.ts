import { withAuth, withDatabase } from "./middlewares";
import { newMiddleware, serve } from "./utils";
import { auth, type Session, type User } from "@/auth";
import { APP_URL, VERSION } from "@/env";
import { getCountries } from "@/modules/geo";
import { deletePracticeUnit, getAllPracticeUnits, postPracticeUnit } from "@/modules/practice";
import { getUserSettings, patchUserSettings } from "@/modules/settings";
import { getHighscores, getResultById, getResults, postResult } from "@/modules/trial";
import { Er } from "@/utils/er";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ResultAsync } from "neverthrow";

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
          allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
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

      // practice routes
      .post("/practice/units", (h: Context) => {
        return serve(h, withAuthAndDatabase, (ctx) =>
          ResultAsync.fromPromise(h.req.json(), () =>
            Er.new("json_error", "Failed to parse JSON"),
          ).andThen((practiceUnit) => postPracticeUnit({ ...ctx, practiceUnit })),
        );
      })
      .get("/practice/units", (h: Context) => {
        return serve(h, withAuthAndDatabase, getAllPracticeUnits);
      })
      .delete("/practice/units/:region/:mode", (h: Context) => {
        return serve(h, withAuthAndDatabase, (ctx) =>
          deletePracticeUnit({ ...ctx, region: h.req.param("region"), mode: h.req.param("mode") }),
        );
      })

      // user settings routes
      .get("/user/settings", (h: Context) => {
        return serve(h, withAuthAndDatabase, getUserSettings);
      })
      .patch("/user/settings", (h: Context) => {
        return serve(h, withAuthAndDatabase, (ctx) =>
          ResultAsync.fromPromise(h.req.json(), () =>
            Er.new("json_error", "Failed to parse JSON"),
          ).andThen((patch) => patchUserSettings({ ...ctx, patch })),
        );
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
