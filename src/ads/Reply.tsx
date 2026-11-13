// The Reply. A candidate's profile -> scroll to the answer -> Chat Now -> the boss's message -> typing -> the reply
// -> a Meet invite -> end card. Big time stamps beside the two bubbles show how fast the reply came.
import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FontGate, INTER } from "../brand";
import { assertProps, zBossPhoto, zCandidate, zEndCard, zHeadline, zMeet, zMessage } from "../schema";
import { answerScroll, bubbleHeight, ChatL2, CL, FindTalent, growCap, Msg, Phone, PHONE_H, PHONE_W, PHONE_X, press, Push, S, sp, push, Thread } from "../kit/phone";
import { Audience, CornerLogo, EndStack, fitHeadline, Headline, RIGHT_EDGE } from "../kit/type";

export const replySchema = z.object({
  colors: z.object({ background: zColor(), text: zColor(), accent: zColor() }),
  audience: z.string().min(1).max(40),
  headlineLine1: zHeadline(),
  headlineLine2: zHeadline(),
  candidate: zCandidate,
  /** the role the boss is hiring for (shown in the chat header as "For: ...") */
  hiringFor: z.string().min(1).max(30),
  /** the boss's first message; its time also becomes the big stamp on the right */
  message: zMessage,
  /** the candidate's reply; its time becomes the big stamp on the left */
  reply: zMessage,
  meet: zMeet.extend({ time: z.string().min(1).max(10) }),
  chips: z.array(z.string().min(1).max(24)).min(1).max(3),
  bossPhoto: zBossPhoto,
  endCard: zEndCard,
});
export type ReplyProps = z.infer<typeof replySchema>;

export const REPLY_FRAMES = 340;

// timeline (frames at 30 fps)
const SCROLL = 48; // scroll to the answer
const TAP = 86; // Chat Now
const PUSH = 92;
const SENT = 104;
const TYPING = 146;
const REPLY = 172;
const MEET = 218;
const EXIT = 262; // phone leaves
const RISE = 270; // headline rises to the end position
const END = 280; // logo, pill, badges

const PHONE_TOP = 986 - PHONE_H; // body bottom at y 986, the top bleeds off
const SCREEN_TOP = PHONE_TOP + 13;
const appY = (y: number) => SCREEN_TOP + y * S;
const GAP = 6;
const BOTTOM = 711;

/** "10:02 AM" -> "10:02" */
const bigTime = (t: string) => t.replace(/\s*[AaPp]\.?[Mm]\.?$/, "");

const thread = (p: ReplyProps, f: number, h: { typing: number }): Thread => {
  const c = p.candidate;
  const msgs: Msg[] = [
    { from: "me", text: p.message.text, time: p.message.time, at: SENT },
    f < REPLY
      ? { from: "them", kind: "typing", time: "", at: TYPING }
      : { from: "them", text: p.reply.text, time: p.reply.time, at: REPLY, from0: h.typing },
    { from: "me", kind: "meet", time: p.meet.time, at: MEET, meet: { when: p.meet.when, what: p.meet.what } },
  ];
  return { name: c.name, role: `${c.title}, ${c.company}`, forRole: p.hiringFor, photo: c.photo, msgs, chips: p.chips, intro: { title: `${c.title} at ${c.company}`, facts: `${c.years} · ${c.area} · ${c.ctc}` } };
};

/** a big time stamp in the margin, beside its bubble */
const Stamp: React.FC<{ f: number; at: number; y: number; side: "left" | "right"; color: string; children: string }> = ({ f, at, y, side, color, children }) => {
  const k = sp(f, at, 14, 260);
  if (f < at) return null;
  const x = side === "left" ? { left: 40, width: PHONE_X - 40 - 18, textAlign: "right" as const } : { left: PHONE_X + PHONE_W + 18, width: 1080 - (PHONE_X + PHONE_W + 18) - 40, textAlign: "left" as const };
  return (
    <div style={{ position: "absolute", top: y - 24, ...x, fontFamily: INTER, fontWeight: 700, fontSize: 40, lineHeight: "48px", letterSpacing: "-0.02em", color, whiteSpace: "nowrap", opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 16}px)` }}>
      {children}
    </div>
  );
};

const Ad: React.FC<ReplyProps> = (p) => {
  const f = useCurrentFrame();
  const { background, text, accent } = p.colors;

  // measured heights of the bubbles (app points): they place the big stamps beside the right bubble
  const H = {
    sent: bubbleHeight({ from: "me", text: p.message.text, time: p.message.time, at: 0 }),
    typing: bubbleHeight({ from: "them", kind: "typing", time: "", at: 0 }),
    reply: bubbleHeight({ from: "them", text: p.reply.text, time: p.reply.time, at: 0 }),
    meet: bubbleHeight({ from: "me", kind: "meet", time: p.meet.time, at: 0, meet: p.meet }),
  };
  // the bottom-anchored thread grows as each bubble's max-height springs open, exactly as in ChatL2
  const eff = (k: number, h: number, start = 0) => Math.min(h, start + Math.max(0, k) * (growCap(h) - start));
  const slot = f < TYPING ? 0 : f < REPLY ? eff(sp(f, TYPING, 14, 300), H.typing) + GAP : eff(sp(f, REPLY, 14, 300), H.reply, H.typing) + GAP;
  const meetH = f < MEET ? 0 : eff(sp(f, MEET, 14, 300), H.meet) + GAP;
  const centres = { sent: BOTTOM - meetH - slot - H.sent / 2, reply: BOTTOM - meetH - H.reply / 2 };

  const scroll = answerScroll(p.candidate) * sp(f, SCROLL, 16, 200);
  const exit = interpolate(f, [EXIT, EXIT + 10], [0, 1], { ...CL, easing: (t) => t * t });
  const rise = sp(f, RISE, 16, 200);
  // headline block: audience at 1044, two lines under it; at the end it sits under the logo
  const HEAD_Y = 1044;
  const HEAD_END = 620;
  const hy = HEAD_Y + (HEAD_END - HEAD_Y) * rise;
  const size = fitHeadline([p.headlineLine1, p.headlineLine2], 94, RIGHT_EDGE - 66);
  const pitch = (90 * size) / 94;
  const screen = (
    <Push
      k={push(f, PUSH)}
      from={<FindTalent p={p.candidate} me={p.bossPhoto} scroll={scroll} chatPress={press(f, TAP)} />}
      to={<ChatL2 t={thread(p, f, H)} f={f} anchor="bottom" />}
    />
  );
  const shift = -1150 * exit;
  return (
    <AbsoluteFill style={{ background }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
        <Phone top={PHONE_TOP}>{screen}</Phone>
        <Stamp f={f} at={SENT} y={appY(centres.sent)} side="right" color={text}>{bigTime(p.message.time)}</Stamp>
        <Stamp f={f} at={REPLY} y={appY(centres.reply)} side="left" color={text}>{bigTime(p.reply.time)}</Stamp>
      </div>
      <Audience color={text} top={hy} left={72}>{p.audience}</Audience>
      <Headline line={p.headlineLine1} size={size} color={text} accent={accent} style={{ left: 66, top: hy + 46 }} />
      <Headline line={p.headlineLine2} size={size} color={text} accent={accent} style={{ left: 66, top: hy + 46 + pitch }} />
      {f >= END ? <EndStack f={f} at={END} logoTop={370} pillTop={905} badgesTop={1021} end={p.endCard} left={72} /> : null}
      <CornerLogo tone={p.endCard.logo} f={f} out={END} />
    </AbsoluteFill>
  );
};

export const ReplyAd: React.FC<ReplyProps> = (p) => {
  assertProps(replySchema, p, "R7-Reply");
  return (
    <FontGate>
      <Ad {...p} />
    </FontGate>
  );
};
