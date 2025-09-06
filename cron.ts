import { refresh } from "./refresh.ts";

Deno.cron("refresh", "59 9 * * *", () => {
  refresh();
});
