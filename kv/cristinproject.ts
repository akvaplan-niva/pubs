import { Pub } from "../pub/types.ts";
import { kv } from "./kv.ts";

export const refreshNvaCristinProjectPubKvIndex = async () => {
  for await (
    const { value } of kv.list<Pub>({
      prefix: ["pub"],
    })
  ) {
    try {
      const { projects } = value;
      if (
        projects && projects?.length > 0 &&
        projects.some(({ cristin }) => cristin! > 0)
      ) {
        for (const p of projects) {
          const key = [
            "cristinproject_pub",
            Number(p.cristin),
            String(value.id),
          ];
          await kv.set(key, value);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
};
