import { refresh } from "./refresh.ts";

Deno.cron("refresh", "13 13 * * *", () => {
  //refresh();
});
