import { refreshNvaPubs } from "./refresh.ts";

Deno.cron("Refresh NVA", "21 11 * * *", async () => {
  console.log("NVA refresh started", new Date());
  await refreshNvaPubs();
});
