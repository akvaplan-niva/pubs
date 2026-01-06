export const isHandle = (hdl: string) => hdl && /^[0-9]+\/[0-9]+$/.test(hdl);
export const isHandleUrl = (hdl: URL | string | undefined) => {
  if (hdl && URL.canParse(hdl)) {
    const { pathname, hostname } = new URL(hdl);
    return "hdl.handle.net" === hostname && isHandle(pathname.slice(1));
  }
  return false;
};

export const handleUrlString = (h: string | URL) =>
  new URL(new URL(h).pathname, "https://hdl.handle.net").href;
