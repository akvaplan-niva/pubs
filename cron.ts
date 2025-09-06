import { refresh } from "./refresh.ts";

Deno.cron("refresh", "9 53 * * *", () => {
  refresh();
});
