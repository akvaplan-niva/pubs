import { InferType } from "yup";
import { authorOrContributorSchema, pubSchema } from "./validate_pub.ts";

export interface DoiRegObject {
  doi: string;
  reg: string;
}
export interface Pub extends InferType<typeof pubSchema> {}

export interface PubContributor
  extends InferType<typeof authorOrContributorSchema> {}

// export interface Pub {
//   id: string; // URI / universally unique
//   published: Date | string;
//   printed?: Date | string;
//   type: string;
//   container?: string;
//   title: string;
//   authors: PubAuthor[];
//   doi?: string; // naked DOI, starting with 10.
//   license?: string;
//   pdf?: string;
//   reg?: string;
// }

// export type PubAuthor = {
//   family: string;
//   given: string;
//   name?: string;
// };
