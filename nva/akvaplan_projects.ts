import _existingProjects from "./akvaplan_projects.json" with { type: "json" };
import type { NvaProject } from "./types.ts";
import { getNvaConfigFromEnv } from "./config.ts";

const { base } = getNvaConfigFromEnv();

const akvaplanNvaProjectIds = new Set(JSON.parse(`[
  459944,520677,574050,358489,2497245,2056945,446702,536386,2497249,635409,2495949,2559966,433189,2709856,531973,2516828,2683071,2517155,2551323,576385,549447,2497253,423190,423211,2545183,2041683,483771,2703192,2703197,2558253,666669,2497164,2503693,2524794,2709830,674684,2041457,2520086,2558362,684913,412071,520872,2044702,536331,536879,517825,2568769,621867,2572443
]`));
// 404702 { status: 403, statusText: "Forbidden" }
// 566614 { status: 403, statusText: "Forbidden" }

const projects = new Map<
  string,
  Pick<
    NvaProject,
    "title" | "startDate" | "endDate" | "coordinatingInstitution"
  >
>(_existingProjects);
const ids = new Set([...projects.keys()]);

const buildProjectId = (
  ident: string,
  projectBase = new URL("/cristin/project/", base),
) => new URL(ident, projectBase).href;

const getProjectFromNvaApi = async (ident: string) => {
  const r = await fetch(buildProjectId(ident));
  if (r?.ok) {
    return await r.json() as NvaProject;
  } else {
    const { status, statusText } = r;
    console.error(ident, { status, statusText });
  }
};
export const getProject = async (ident: string) =>
  await Promise.resolve(projects.get(ident));

const refreshAkvaplanProjects = async () => {
  const newProjects = akvaplanNvaProjectIds.difference(
    ids,
  ) as Set<string>;

  for await (const identifier of newProjects) {
    const project = await getProjectFromNvaApi(identifier);
    if (project) {
      const { title, startDate, endDate, coordinatingInstitution } = project;
      projects.set(identifier, {
        title,
        startDate,
        endDate,
        coordinatingInstitution,
      });
    }
  }
  await Deno.writeTextFile(
    "./nva/akvaplan_projects.json",
    JSON.stringify([...projects], null, "  "),
  );
};

if (import.meta.main) {
  refreshAkvaplanProjects();
}
