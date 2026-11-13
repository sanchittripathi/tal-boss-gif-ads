// Tal Does. Three candidates on Find talent, each read down to their answer; Chat Now on the third; they answer back;
// the answer line ("TAL DOES.") answers the headline's question.
import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FontGate } from "../brand";
import { assertProps, zBossPhoto, zCandidate, zEndCard, zHeadline, zMessage } from "../schema";
import { answerScroll, ChatL2, CL, FindTalent, Msg, Phone, PHONE_H, press, Push, push, sp, Thread } from "../kit/phone";
import { Audience, CornerLogo, EndStack, fitHeadline, Headline, RIGHT_EDGE } from "../kit/type";

export const talDoesSchema = z.object({
  colors: z.object({ background: zColor(), text: zColor(), accent: zColor() }),
  audience: z.string().min(1).max(40),
  /** the question, over two lines; *stars* mark the accent colour */
  questionLine1: zHeadline(),
  questionLine2: zHeadline(),
  /** the answer line, drawn in the accent colour */
  answer: zHeadline(),
  /** three profiles in order; the boss chats with the third */
  candidates: z.array(zCandidate).length(3),
  hiringFor: z.string().min(1).max(30),
  message: zMessage,
  reply: zMessage,
  chips: z.array(z.string().min(1).max(24)).min(1).max(3),
  bossPhoto: zBossPhoto,
  endCard: zEndCard,
});
export type TalDoesProps = z.infer<typeof talDoesSchema>;

export const TAL_DOES_FRAMES = 354;

// timeline: each profile rests, scrolls once to the answer, then the next slides in
const SCROLL = [30, 96, 162];
const NEXT = [66, 132];
const TAP = 198;
const PUSH = 202;
const SENT = 214;
const REPLY = 240;
const EXIT = 280;
const RISE = 286;
const ANSWER = 296; // TAL DOES.
const END = 304;

const PHONE_TOP = 986 - PHONE_H;

const thread = (p: TalDoesProps): Thread => {
  const c = p.candidates[2];
  const msgs: Msg[] = [
    { from: "me", text: p.message.text, time: p.message.time, at: SENT },
    { from: "them", text: p.reply.text, time: p.reply.time, at: REPLY },
  ];
  return { name: c.name, role: `${c.title}, ${c.company}`, forRole: p.hiringFor, photo: c.photo, msgs, chips: p.chips, intro: { title: `${c.title} at ${c.company}`, facts: `${c.years} · ${c.area} · ${c.ctc}` } };
};

const Ad: React.FC<TalDoesProps> = (p) => {
  const f = useCurrentFrame();
  const { background, text, accent } = p.colors;
  const cs = p.candidates;
  const profile = (i: number) => <FindTalent p={cs[i]} me={p.bossPhoto} scroll={answerScroll(cs[i]) * sp(f, SCROLL[i], 16, 200)} chatPress={i === 2 ? press(f, TAP) : 1} />;
  let screen: React.ReactNode;
  if (f < NEXT[1]) screen = <Push k={push(f, NEXT[0], 9)} from={profile(0)} to={profile(1)} />;
  else if (f < PUSH) screen = <Push k={push(f, NEXT[1], 9)} from={profile(1)} to={profile(2)} />;
  else screen = <Push k={push(f, PUSH)} from={profile(2)} to={<ChatL2 t={thread(p)} f={f} anchor="bottom" />} />;

  const exit = interpolate(f, [EXIT, EXIT + 10], [0, 1], { ...CL, easing: (t) => t * t });
  const rise = sp(f, RISE, 16, 200);
  const HEAD_Y = 1040;
  const HEAD_END = 540;
  const hy = HEAD_Y + (HEAD_END - HEAD_Y) * rise;
  const ans = sp(f, ANSWER, 13, 260);
  const SIZE = fitHeadline([p.questionLine1, p.questionLine2, p.answer], 108, RIGHT_EDGE - 66);
  const LH = Math.round(SIZE * 0.92);
  return (
    <AbsoluteFill style={{ background }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-1150 * exit}px)` }}>
        <Phone top={PHONE_TOP}>{screen}</Phone>
      </div>
      <Audience color={text} top={hy}>{p.audience}</Audience>
      <Headline line={p.questionLine1} size={SIZE} color={text} accent={accent} style={{ left: 66, top: hy + 44 }} />
      <Headline line={p.questionLine2} size={SIZE} color={text} accent={accent} style={{ left: 66, top: hy + 44 + LH }} />
      {f >= ANSWER ? (
        <Headline line={p.answer} size={SIZE} color={accent} accent={accent} style={{ left: 66, top: hy + 44 + LH * 2, opacity: Math.min(1, ans * 2), transform: `translateY(${(1 - ans) * -30}px)` }} />
      ) : null}
      {f >= END ? <EndStack f={f} at={END} logoTop={270} pillTop={922} badgesTop={1038} end={p.endCard} left={72} /> : null}
      <CornerLogo tone={p.endCard.logo} f={f} out={END} />
    </AbsoluteFill>
  );
};

export const TalDoesAd: React.FC<TalDoesProps> = (p) => {
  assertProps(talDoesSchema, p, "R7-TalDoes");
  return (
    <FontGate>
      <Ad {...p} />
    </FontGate>
  );
};
