import { Publication } from "./pub_types.ts";
import {
  array,
  date,
  //type InferType,
  number,
  object,
  ObjectSchema,
  string,
  ValidationError,
} from "yup";

const dateTransform = (_current: unknown, original: string | Date) =>
  new Date(original);

const authorSchema = object({
  family: string().default(""),
  given: string().default(""),
  name: string().optional(),
});

// FIXME Add modified date to Publication schema
const pubSchema: ObjectSchema<Publication> = object({
  id: string().required(),
  published: date().required().transform(dateTransform),
  printed: date().optional().transform(dateTransform),
  type: string().required(),
  container: string().default(""),
  title: string().required(),
  authors: array().required().of(authorSchema),
  doi: string().required(),
  license: string().optional(),
  cites: number().optional(),
  pdf: string().optional(),
  reg: string().optional(),
});

//export interface PublicationSchema extends InferType<typeof pubSchema> {}

export const validatePub = async (value: unknown) => {
  try {
    await pubSchema.validate(value);
  } catch (e) {
    if (e instanceof ValidationError) {
      return e;
    }
  }
};
