import {
  array,
  boolean,
  date,
  number,
  object,
  string,
  ValidationError,
} from "yup";

export const identityObject = object({
  id: string(),
  openalex: string().optional(),
});

const names = {
  family: string().optional(),
  given: string().optional(),
  name: string().optional(),
};

export const authorOrContributorSchema = object({
  ...names,
  identity: object({
    id: string(),
    ...names,
    prior: boolean().optional(),
    openalex: string().nullable().optional(),
    orcid: string().nullable().optional(),
  }).optional(),
  position: number().optional(),
});

export const AkvaplanistCount = object({
  total: number(),
  current: number(),
  prior: number(),
  when: date(),
});

const projectSchema = object({
  cristin: number().optional(),
});

export const pubSchema = object({
  id: string().required(),
  url: string().optional(),
  published: string().required(), // `published` is type string (and not date) since it may be "yyyy" or "yyyy-mm" in addition to (iso)date and date-time
  printed: string().optional(),
  type: string().required(),
  container: string().optional(),
  title: string().required(),
  authors: array().required().of(authorOrContributorSchema),
  contributors: array().optional().of(authorOrContributorSchema),
  doi: string().optional(),
  nva: string().optional(),
  license: string().optional(),
  cites: number().optional(),
  pdf: string().optional(),
  reg: string().optional(),
  created: date().required().default(new Date()),
  modified: date().required().default(new Date()),
  akvaplanists: AkvaplanistCount.optional(),
  parent: string().optional(),
  projects: array().optional().of(projectSchema),
});

export const validatePub = async (value: unknown) => {
  try {
    await pubSchema.validate(value);
  } catch (e) {
    if (e instanceof ValidationError) {
      return e;
    }
  }
};
