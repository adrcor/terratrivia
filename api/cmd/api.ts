import { api } from "@/api";
import { PORT } from "@/env";

Bun.serve({ fetch: api.fetch, port: PORT });
console.log(`listening on port ${PORT}`);
