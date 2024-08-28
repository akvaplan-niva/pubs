import { TextLineStream, toTransformStream } from "@std/streams";
export const saveResponse = async (r: Response, path: string | URL) => {
  if (r.body) {
    const file = await Deno.open(path, { write: true, create: true });
    await r.body.pipeTo(file.writable);
  }
};

export const ndjsonStream = <T>(stream: ReadableStream) =>
  stream.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(
      toTransformStream(async function* (src: AsyncIterable<string>) {
        for await (const chunk of src) {
          if (chunk.trim().length > 0) {
            yield JSON.parse(chunk) as T;
          }
        }
      }),
    );
