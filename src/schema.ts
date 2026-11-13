// Shared prop schemas. Everything a marketer changes is a prop; the animation code reads only these.
import { z } from "zod";
import { zColor, zTextarea } from "@remotion/zod-types";
import { PHOTOS } from "./people";

/** a face from public/people/ */
export const zPhoto = z.enum(PHOTOS);

/** a candidate as shown on a Find talent profile */
export const zCandidate = z.object({
  name: z.string().min(1).max(30),
  /** job title, e.g. "Backend Lead" */
  title: z.string().min(1).max(36),
  company: z.string().min(1).max(24),
  /** neighbourhood, e.g. "HSR Layout" */
  area: z.string().min(1).max(24),
  city: z.string().min(1).max(16),
  years: z.string().max(12),
  ctc: z.string().max(12),
  /** the prompt's question, e.g. "What I'm proudest of" */
  question: z.string().min(1).max(40),
  /** the prompt's answer: up to about four lines on the profile */
  answer: zTextarea().min(1).max(120),
  photo: zPhoto,
  /** where the face sits in the photo, 0 to 1 from the left / top */
  focusX: z.number().min(0).max(1),
  focusY: z.number().min(0).max(1),
  zoom: z.number().min(1).max(3),
  /** for tight photos: draw the whole photo at this height and top (app points, box is 375 tall) instead of cover-cropping */
  photoFit: z.object({ height: z.number().min(100).max(375), top: z.number().min(0).max(275) }).nullable(),
  /** extra scroll in app points on top of the automatic "answer above the dock" scroll; usually 0 */
  scrollNudge: z.number().min(-100).max(200),
});
export type Candidate = z.infer<typeof zCandidate>;

/** someone in the chat list */
export const zPerson = z.object({ name: z.string().min(1).max(30), title: z.string().min(1).max(30), company: z.string().min(1).max(24), photo: zPhoto });
export type Person = z.infer<typeof zPerson>;

/** a chat message: text and the time under it ("10:02 AM") */
export const zMessage = z.object({ text: zTextarea().min(1).max(160), time: z.string().min(1).max(10) });

/** a Google Meet invite card */
export const zMeet = z.object({ when: z.string().min(1).max(30), what: z.string().min(1).max(30) });

/** the end card: logo, Install pill and store badges (also the corner logo's colour) */
export const zEndCard = z.object({
  logo: z.enum(["dark", "cream"]),
  installLabel: z.string().min(1).max(24),
  pill: z.enum(["dark", "light"]),
  storeBadges: z.boolean(),
});

/** the boss's own avatar in the tab bar */
export const zBossPhoto = zPhoto;

/** a headline line. Wrap words in *stars* for the accent colour. Write it in capitals; it is not upper-cased for you. */
export const zHeadline = () => z.string().min(1).max(40);

/** stop with a readable message if a variant's props don't match the ad's schema */
export const assertProps = (schema: z.ZodType, props: unknown, ad: string): void => {
  const r = schema.safeParse(props);
  if (!r.success) throw new Error(`${ad}: these props don't fit the schema (see README > Props):\n${z.prettifyError(r.error)}`);
};
