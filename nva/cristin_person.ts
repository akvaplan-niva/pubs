import { kv } from "../kv/kv.ts";
import { getNvaConfigFromEnv } from "./config.ts";

interface CristinPersonNames {
  names: { type: string; value: string }[];
  verified: boolean;
}

const extractNames = (person: CristinPersonNames) => {
  const given = person
    ? person.names.find(({ type }) => "FirstName" === type)?.value
    : null;
  const family = person
    ? person.names.find(({ type }) => "LastName" === type)?.value
    : null;

  if (family && given) {
    return {
      family,
      given,
      verified: person.verified,
      when: new Date(),
    };
  }
};

// const getCristinId = (identity: { id: string }) => {
//   const _id = identity && identity?.id ? identity.id?.split("/")?.at(-1) : null;
//   return _id ? Number(_id) : null;
// };
// const { contributors } = value.entityDescription;
// for (const { identity } of contributors) {
//   const id = getCristinId(identity);
//   const person = id ? await getFamilyGnameLookupivenOfCristinPerson(id) : null;
//   if (person) {
//     console.warn(value.id, person);
//   }
// }

export const nvaCristinPersonUrl = (id: number | string) => {
  const { base } = getNvaConfigFromEnv();
  const url = new URL(
    `/cristin/person/${id}`,
    base,
  );
  return url;
};

export const getCristinPersonFromNvaApi = async (id: number) => {
  const r = await fetch(nvaCristinPersonUrl(id));
  if (r?.ok) {
    return await r.json() as CristinPersonNames;
  }
};

export const getFamilyGivenOfCristinPerson = async (id: number) => {
  const key = ["cristin", "person", id];
  const entry = await kv.get(key);
  if (entry.versionstamp) {
    return entry.value;
  } else {
    const person = await getCristinPersonFromNvaApi(id);
    if (person) {
      const value = extractNames(person);
      await kv.set(key, value);
      return value;
    }
  }
};
