interface DoiRegistrar {
  agency: string;
  doi: string;
  status: string;
}
export const isDoiName = (name: string) =>
  name && name?.startsWith("10.") && name?.includes("/");

/**
 *  DOI URL string (unescaped, lowercase) from naked DOI name
 */
export const decodedDoiUrlString = (name: string) =>
  decodeURI( // Use unescaped DOI name in URL
    new URL(
      name.toLowerCase(),
      "https://doi.org",
    ).href,
  );

export const registrationAgencyUrl = (name: string) =>
  new URL(
    `/doiRA/${name}`,
    "https://doi.org",
  ).href;
export const getRegistrar = async (name: string) => {
  const r = await fetch(registrationAgencyUrl(name));
  const [{ RA, status, DOI }] = await r.json();
  const reg: DoiRegistrar = { agency: RA, status, doi: DOI } as const;
  return reg;
};
