import {
  array,
  date,
  type InferType,
  number,
  object,
  string,
  ValidationError,
} from "yup";

const authorSchema = object({
  family: string().default(""),
  given: string().default(""),
  name: string().optional(),
});

const pubSchema = object({
  id: string().required(),
  published: string().required(),
  printed: date().optional(),
  type: string().required(),
  container: string().default(""),
  title: string().required(),
  authors: array().required().of(authorSchema),
  doi: string().optional(),
  license: string().optional(),
  cites: number().optional(),
  pdf: string().optional(),
  reg: string().optional(),
  created: date().required(),
  modified: date().required().default(new Date()),
});

export interface Pub extends InferType<typeof pubSchema> {}

export const validatePub = async (value: unknown) => {
  try {
    await pubSchema.validate(value);
  } catch (e) {
    if (e instanceof ValidationError) {
      return e;
    }
  }
};
