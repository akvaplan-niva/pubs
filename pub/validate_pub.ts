import { array, date, number, object, string, ValidationError } from "yup";

export const authorSchema = object({
  family: string().optional(),
  given: string().optional(),
  name: string().optional(),
  identity: object().optional(),
});

export const pubSchema = object({
  id: string().required(),
  published: string().required(), // `published` is type string (and not date) since it may be "yyyy" or "yyyy-mm" in addition to (iso)date and date-time
  printed: string().optional(),
  type: string().required(),
  container: string().optional(),
  title: string().required(),
  authors: array().required().of(authorSchema),
  doi: string().optional(),
  nva: string().optional(),
  license: string().optional(),
  cites: number().optional(),
  pdf: string().optional(),
  reg: string().optional(),
  created: date().required().default(new Date()),
  modified: date().required().default(new Date()),
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
