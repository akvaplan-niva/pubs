import { kv } from "../kv/kv.ts";
import { getNvaConfigFromEnv } from "./config.ts";

export interface CristinPerson {
  id: string; //"https://api.nva.unit.no/cristin/person/n";
  "@context": "https://bibsysdev.github.io/src/person-context.json";
  names: Name[];
  verified: boolean;
  type: "Person";
  identifiers: [{ type: "CristinIdentifier"; value: "n" }];
  // affiliations: [
  //   {
  //     type: "Affiliation",
  //     organization: "https://api.nva.unit.no/cristin/organization/…",
  //     active: false,
  //     role: { type: "Role", labels: [?] }
  //   }
  // ],
  // verified: true,
  // keywords: [],
  // background: {},
  // place: {},
  // collaboration: {},
  // countries: [],
  // awards: []
}

type NameType =
  | "FirstName"
  | "LastName"
  | "PreferredFirstName"
  | "PreferredLastName";

interface Name {
  type: NameType;
  value: string;
}

const findNameType = (
  needle: NameType,
  names: Name[],
) => names.find(({ type }) => needle === type)?.value.trim();

export const extractNames = (person: CristinPerson) => {
  const gn = findNameType("FirstName", person.names);
  const fn = findNameType("LastName", person.names);
  const gp = findNameType("PreferredFirstName", person.names);
  const fp = findNameType("PreferredLastName", person.names);
  const family = fp ? fp : fn ?? null;
  const given = gp ? gp : gn ?? null;
  if (family && given) {
    return {
      family,
      given,
      verified: person.verified,
      when: new Date(),
      spelling: fp || gp ? { fn: [fn], gn: [gn] } : undefined,
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

{
}

export const getCristinPersonFromNvaApi = async (id: number) => {
  const r = await fetch(nvaCristinPersonUrl(id));
  if (r?.ok) {
    return await r.json() as CristinPerson;
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
