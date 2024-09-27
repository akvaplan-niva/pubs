export const isHandle = (hdl: string) => /^[0-9]+\/[0-9]+$/.test(hdl);
export const isHandleUrl = (hdl: string) => {
  if (URL.canParse(hdl)) {
    const { pathname, hostname } = new URL(hdl);
    return "hdl.handle.net" === hostname && isHandle(pathname.slice(1));
  }
  return false;
};

export const handleUrlString = (h: string | URL) =>
  new URL(new URL(h).pathname, "https://hdl.handle.net").href;
