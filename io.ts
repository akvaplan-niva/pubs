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
    .pipeThrough<T>(
      toTransformStream(async function* (src: AsyncIterable<string>) {
        for await (const chunk of src) {
          if (chunk.trim().length > 0) {
            yield JSON.parse(chunk) as T;
          }
        }
      }),
    );

export async function* fetchAndStreamJson<T>(url: URL | string) {
  const r = await fetch(url);
  if (r.ok) {
    for await (const entry of await r.json() as { value: T }[]) {
      yield entry?.value;
    }
  }
}
export const fetchAndStreamNdjson = async <T>(url: URL) =>
  ndjsonStream<T>((await fetch(url))?.body!);
