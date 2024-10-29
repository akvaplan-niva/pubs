import { getNva } from "./api.ts";
import { NvaChannel } from "./types.ts";

export const getChannel = async (id: string | URL) =>
  await getNva<NvaChannel>(id);
