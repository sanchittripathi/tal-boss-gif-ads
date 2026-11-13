// Silk Board. The wall of type never moves; the phone does: Your turn (3) -> answer each chat (a Meet invite or a quick
// reply) -> each row moves to Their turn -> Your turn (0). Then the phone drops out and the end card takes its place.
import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FontGate } from "../brand";
import { assertProps, zBossPhoto, zEndCard, zHeadline, zMeet, zMessage, zPerson } from "../schema";
import { ChatL2, ChatList, CL, Msg, Phone, press, Push, push, Row, sp, Thread } from "../kit/phone";
import { Audience, CORNER_LOGO_LEFT, CornerLogo, EndStack, fitHeadline, Headline, RIGHT_EDGE } from "../kit/type";

const zChat = z.object({
  person: zPerson,
  /** the role this chat is about ("For: ...") */
  hiringFor: z.string().min(1).max(30),
  /** what they sent, oldest first; the last one's time shows in the list, and the count is the unread badge */
  incoming: z.array(zMessage).min(1).max(3),
  /** the preview line in the list (usually a shortened last message) */
  preview: z.string().min(1).max(60),
  /** the boss's answer. Its time is used for the Meet invite too */
  answer: zMessage,
  /** set this to send a Meet invite instead of the text answer */
  meetInvite: zMeet.nullable(),
});

export const silkBoardSchema = z.object({
  colors: z.object({ background: zColor(), text: zColor(), highlight: zColor() }),
  audience: z.string().min(1).max(40),
  /** the repeated line */
  line: zHeadline(),
  /** how many times it repeats */
  repeat: z.number().int().min(1).max(5),
  /** the line under them, in the highlight colour */
  lastLine: zHeadline(),
  /** the phone's clock */
  clock: z.string().min(1).max(5),
  /** the filter chips above the list; count is shown in brackets, or null for none */
  tabs: z.array(z.object({ label: z.string().min(1).max(20), count: z.number().int().min(0).nullable() })).min(1).max(5),
  /** the three chats in "Your turn", answered in order */
  yourTurn: z.array(zChat).length(3),
  /** rows already in "Their turn" */
  theirTurn: z.array(z.object({ person: zPerson, preview: z.string().min(1).max(60), time: z.string().min(1).max(10) })).max(4),
  /** the number in "Their turn (n)" before the boss starts */
  theirTurnTotal: z.number().int().min(0).max(99),
  bossPhoto: zBossPhoto,
  endCard: zEndCard,
});
export type SilkBoardProps = z.infer<typeof silkBoardSchema>;
type Chat = SilkBoardProps["yourTurn"][number];

export const SILK_BOARD_FRAMES = 345;

const PHONE_TOP = 540;

// timeline: per chat, the row is pressed, the chat pushes in, the boss answers, the chat pops back, the row leaves
const PRESS = [48, 150, 210];
const IN = [52, 154, 214];
const ANSWER = [90, 168, 228]; // a Meet invite is pressed 6 frames before
const OUT = [120, 184, 244];
const LEAVE = [132, 196, 256];
const DROP = 286;
const END = 296;

const leaveK = (f: number, at: number) => (f < at ? 0 : Math.min(1, sp(f, at, 18, 260)));
const hlK = (f: number, at: number) => interpolate(f, [at, at + 2, at + 8], [0, 1, 0], CL);

const role = (c: Chat["person"]) => `${c.title}, ${c.company}`;
const last = (c: Chat) => c.incoming[c.incoming.length - 1];
const pending = (c: Chat): Row => ({ name: c.person.name, role: role(c.person), preview: c.preview, time: last(c).time, n: c.incoming.length, photo: c.person.photo });
const done = (c: Chat): Row => ({ ...pending(c), preview: c.meetInvite ? "You: Meet invite sent" : `You: ${c.answer.text}`, time: c.answer.time, n: 0 });

const list = (p: SilkBoardProps, f: number) => {
  // which rows are still mine, who is leaving, and what has moved to their turn
  const gone = LEAVE.map((at) => f >= at + 12);
  const idx = [0, 1, 2].filter((j) => !gone[j]);
  const mine = idx.map((j) => pending(p.yourTurn[j]));
  let leaving: { i: number; k: number } | undefined;
  LEAVE.forEach((at, j) => {
    if (f >= at && !gone[j]) leaving = { i: idx.indexOf(j), k: leaveK(f, at) };
  });
  const moved = [2, 1, 0].filter((j) => gone[j]).map((j) => done(p.yourTurn[j]));
  const yourCount = 3 - LEAVE.filter((at) => f >= at).length;
  let hl: { i: number; k: number } | undefined;
  PRESS.forEach((at, j) => {
    const k = hlK(f, at);
    if (k > 0 && !gone[j]) hl = { i: idx.indexOf(j), k };
  });
  const theirs: Row[] = p.theirTurn.map((t) => ({ name: t.person.name, role: role(t.person), preview: t.preview, time: t.time, photo: t.person.photo }));
  return <ChatList tabs={p.tabs} mine={mine} theirs={[...moved, ...theirs]} yourCount={yourCount} theirCount={p.theirTurnTotal + moved.length} leaving={leaving} hl={hl} chatBadge={yourCount || undefined} time={p.clock} me={p.bossPhoto} />;
};

const thread = (c: Chat, j: number): Thread => {
  const msgs: Msg[] = c.incoming.map((m) => ({ from: "them", text: m.text, time: m.time, at: -100 }));
  msgs.push(c.meetInvite ? { from: "me", kind: "meet", time: c.answer.time, at: ANSWER[j], meet: c.meetInvite } : { from: "me", text: c.answer.text, time: c.answer.time, at: ANSWER[j] });
  return { name: c.person.name, role: role(c.person), forRole: c.hiringFor, photo: c.person.photo, msgs };
};

// the wall of type: LINE px type, PITCH px apart, from TOP; it must end above the phone
const LINE = 110;
const PITCH = 94;
const TOP = 120;
const WALL_BOTTOM = TOP + PITCH * 3 + Math.round(LINE * 0.92); // where the approved ad's four lines end (503)

const Ad: React.FC<SilkBoardProps> = (p) => {
  const f = useCurrentFrame();
  const L = list(p, f);
  const chat = (j: number, meetPress?: number) => <ChatL2 t={thread(p.yourTurn[j], j)} f={f} meetPress={meetPress} time={p.clock} />;
  const meetPress = (j: number) => (p.yourTurn[j].meetInvite ? press(f, ANSWER[j] - 6) : 1);
  let screen: React.ReactNode;
  if (f < OUT[0]) screen = <Push k={push(f, IN[0])} from={L} to={chat(0, meetPress(0))} />;
  else if (f < IN[1]) screen = <Push back k={push(f, OUT[0])} from={chat(0)} to={L} />;
  else if (f < OUT[1]) screen = <Push k={push(f, IN[1])} from={L} to={chat(1, meetPress(1))} />;
  else if (f < IN[2]) screen = <Push back k={push(f, OUT[1])} from={chat(1)} to={L} />;
  else if (f < OUT[2]) screen = <Push k={push(f, IN[2])} from={L} to={chat(2, meetPress(2))} />;
  else screen = <Push back k={push(f, OUT[2])} from={chat(2)} to={L} />;

  // fit the wall: narrow enough for the widest line, short enough to end where the approved ad's wall ends
  const byWidth = fitHeadline([p.line, p.lastLine], LINE, RIGHT_EDGE - 74);
  const tall = PITCH * p.repeat + Math.round(LINE * 0.92);
  const k = Math.min(byWidth / LINE, (WALL_BOTTOM - TOP) / tall, 1);
  const size = LINE * k;
  const pitch = PITCH * k;

  const drop = interpolate(f, [DROP, DROP + 10], [0, 900], { ...CL, easing: (t) => t * t });
  const { background, text, highlight } = p.colors;
  return (
    <AbsoluteFill style={{ background }}>
      <Audience color={text} top={60} maxWidth={CORNER_LOGO_LEFT - 24 - 72}>{p.audience}</Audience>
      <CornerLogo tone={p.endCard.logo} f={f} out={END} />
      {Array.from({ length: p.repeat }, (_, i) => (
        <Headline key={i} line={p.line} size={size} color={text} accent={highlight} style={{ left: 74, top: TOP + pitch * i }} />
      ))}
      <Headline line={p.lastLine} size={size} color={highlight} accent={text} style={{ left: 74, top: TOP + pitch * p.repeat }} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${drop}px)` }}>
        <Phone top={PHONE_TOP}>{screen}</Phone>
      </div>
      {f >= END ? <EndStack f={f} at={END} logoTop={630} pillTop={892} badgesTop={1010} end={p.endCard} left={72} /> : null}
    </AbsoluteFill>
  );
};

export const SilkBoardAd: React.FC<SilkBoardProps> = (p) => {
  assertProps(silkBoardSchema, p, "R7-SilkBoard");
  return (
    <FontGate>
      <Ad {...p} />
    </FontGate>
  );
};
