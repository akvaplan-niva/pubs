import type { PubContributor } from "../pub/types.ts";
export interface Akvaplanist extends PubContributor {
  id: string;
  prior?: boolean;
  orcid?: string;
  openalex?: string;
  spelling?: AkvaplanistSpelling;
}

/**
 * Spelling variants as independent sets of given (gn) & family names (fn)
 */
export interface AkvaplanistSpelling {
  gn: Set<string>;
  fn: Set<string>;
  id: string;
}
