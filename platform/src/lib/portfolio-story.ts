import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform(value => value || null).nullable().optional();

/** The optional task, work and result story behind a project. An empty field is stored as nothing. */
export const portfolioStoryFields = {
  location: optionalText(120),
  task: optionalText(4000),
  work: optionalText(4000),
  result: optionalText(4000),
  clientName: optionalText(120),
  clientRole: optionalText(120),
  clientQuote: optionalText(1000)
};
