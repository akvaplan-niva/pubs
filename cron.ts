import { refresh } from "./refresh.ts";

Deno.cron("refresh", "54 9 * * *", () => {
  refresh();
});
