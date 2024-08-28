export const kvListValuesStream = <T>(
  list: Deno.KvListIterator<T>,
) =>
  new ReadableStream({
    async start(controller) {
      for await (const { value } of list) {
        controller.enqueue(JSON.stringify(value) + "\r\n");
      }
      controller.close();
    },
  });

const textResponse = (rs: ReadableStream) => {
  const body = rs.pipeThrough(new TextEncoderStream());
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf8" },
  });
};

export const kvListStreamer = <T>(
  kv: Deno.Kv,
  sel: Deno.KvListSelector,
  opts: Deno.KvListOptions,
) => {
  const rs = kvListValuesStream(
    kv.list<T>(sel, opts),
  );
  return textResponse(rs);
};
