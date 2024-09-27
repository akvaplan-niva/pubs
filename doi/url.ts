interface DoiRegistrar {
  agency: string;
  doi: string;
  status: string;
}
export const isDoiName = (name: string) =>
  name && name?.startsWith("10.") && name?.includes("/");

export const isDoiUrl = (url: URL | string) => {
  if (URL.canParse(url)) {
    const { pathname, hostname } = new URL(url);
    const [prefix, ...suf] = pathname.slice(1).split("/");
    const suffix = suf.join("/");
    const prenum = Number(prefix.split(/^10\./).at(1));
    return hostname.startsWith("doi.org") && prefix.startsWith("10.") &&
      prenum > 0 && Number.isInteger(prenum) && suffix?.length > 0;
  }
  return false;
};

/**
 *  DOI URL string (unescaped, lowercase) from naked DOI name
 */
export const doiUrlString = (name: string) =>
  decodeURI(
    new URL(name.toLowerCase(), "https://doi.org").href,
  );

/** DOI name (string starting with "10.") from DOI URL */
export const doiName = (url: URL | string) =>
  decodeURIComponent(new URL(url).pathname.slice(1).toLowerCase());

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
