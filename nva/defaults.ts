export const base = new URL(
  Deno.env.get("NVA_BASE") ?? "https://api.nva.unit.no",
);
export const searchParams = [
  ["aggregation", "none"],
  ["from", "0"],
  ["results", "100"],
  ["order", "publication_date"],
  ["sort", "desc"],
];
