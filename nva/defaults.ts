export const base = new URL("https://api.nva.unit.no");
export const authBase = new URL(
  "https://nva-prod.auth.eu-west-1.amazoncognito.com",
);
export const searchParams = [
  ["aggregation", "none"],
  ["from", "0"],
  ["results", "100"],
  ["order", "publication_date"],
  ["sort", "desc"],
];
