// The real Tal Boss screens rebuilt in React at app points (393 x 852), measured from the Boss DS Figma file
// t2q3bf6RzQxpfqIWWnfnaM: Find talent 7521:3225, Chat screen 7529:16928, Chat L2 7529:18899.
// The phone renders them at S = 1.55 (screen 609 px wide on a 1080 canvas). No copy lives here: it all comes in as props.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile } from "remotion";
import { FPS, INTER, SFD, SFT, W } from "../brand";
import type { Candidate } from "../schema";
import { blockHeight, lineWidth, TextStyle } from "./measure";
import {
  IcBack, IcBellOff, IcCalendar, IcChevDown, IcComment, IcCross, IcDockX, IcFilePlus, IcMic, IcPin, IcPlusBtn,
  IcSearch, IcSketch, IcTal, IcWave, IcWhatsapp, StatusBar, IcUndo, IcBookmark, IcShare,
} from "./icons";

// ---------- motion ----------
export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** a quick physical spring, 0 -> 1, settles in about 8 to 10 frames */
export const sp = (f: number, at: number, damping = 15, stiffness = 260) => (f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.6 } }));
/** press: 1 -> 0.94 in 3 frames, back with a spring in 5 */
export const press = (f: number, at: number) => {
  if (f < at) return 1;
  if (f < at + 3) return interpolate(f, [at, at + 3], [1, 0.94], CL);
  return 0.94 + 0.06 * spring({ frame: f - at - 3, fps: FPS, config: { damping: 12, stiffness: 320, mass: 0.5 } });
};
/** iOS push: 0 -> 1 over n frames, ease-out */
export const push = (f: number, at: number, n = 10) => interpolate(f, [at, at + n], [0, 1], { ...CL, easing: (t) => 1 - Math.pow(1 - t, 3) });

// ---------- canvas and phone ----------
export const S = 1.55;
export const SCREEN_W = Math.round(393 * S); // 609
export const SCREEN_H = Math.round(852 * S); // 1321
export const BEZEL = 13;
export const PHONE_W = SCREEN_W + BEZEL * 2; // 635
export const PHONE_H = SCREEN_H + BEZEL * 2; // 1347
export const PHONE_X = Math.round((W - PHONE_W) / 2); // 222

/** Black iPhone 16. `top` is the y of the body's top edge on the 1080 x 1350 canvas. Children are laid out in app points. */
export const Phone: React.FC<{ top: number; x?: number; children: React.ReactNode }> = ({ top, x = PHONE_X, children }) => (
  <div style={{ position: "absolute", left: x, top, width: PHONE_W, height: PHONE_H, borderRadius: 96, background: "#0B0B0C", boxShadow: "inset 0 0 0 2px #3A3A3E, inset 0 0 0 5px #0B0B0C, 0 40px 80px rgba(0,0,0,0.22)" }}>
    <div style={{ position: "absolute", left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, borderRadius: 84, overflow: "hidden", background: "#fff" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, transform: `scale(${S})`, transformOrigin: "0 0", overflow: "hidden" }}>{children}</div>
      {/* Dynamic Island */}
      <div style={{ position: "absolute", left: (SCREEN_W - 126 * S) / 2, top: 11 * S, width: 126 * S, height: 37 * S, borderRadius: 40, background: "#000" }} />
    </div>
  </div>
);

// ---------- text helpers ----------
const TS = {
  inter: (size: number, line: number, weight: number): TextStyle => ({ fontFamily: INTER, fontSize: size, lineHeight: line, fontWeight: weight, letterSpacing: "-0.01em" }),
  sfd: (size: number, line: number, weight: number): TextStyle => ({ fontFamily: SFD, fontSize: size, lineHeight: line, fontWeight: weight }),
  sft: (size: number, line: number, weight: number): TextStyle => ({ fontFamily: SFT, fontSize: size, lineHeight: line, fontWeight: weight, letterSpacing: "-0.01em" }),
};
const css = (s: TextStyle, color: string): React.CSSProperties => ({ fontFamily: s.fontFamily, fontSize: s.fontSize, lineHeight: `${s.lineHeight}px`, fontWeight: s.fontWeight, color, ...(s.letterSpacing ? { letterSpacing: s.letterSpacing } : {}) });
const inter = (size: number, line: number, weight: number, color: string) => css(TS.inter(size, line, weight), color);
const sfd = (size: number, line: number, weight: number, color: string) => css(TS.sfd(size, line, weight), color);
const sft = (size: number, line: number, weight: number, color: string) => css(TS.sft(size, line, weight), color);
/** one line, cut with an ellipsis */
const one: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const widthOf = (text: string, s: TextStyle) => lineWidth(text, s.fontFamily, s.fontSize, s.fontWeight, s.letterSpacing);
/** the ellipsis styles, but only when `text` is wider than `width` (clipping a line that fits would trim glyph edges) */
const cut = (text: string, s: TextStyle, width: number): React.CSSProperties => (widthOf(text, s) > width ? one : {});

// ---------- photographs ----------
export type PhotoSpec = Pick<Candidate, "photo" | "focusX" | "focusY" | "zoom" | "photoFit">;
/** cover-crop a 1035x690 portrait from public/people into a box */
export const Photo: React.FC<{ p: PhotoSpec; w: number; h: number; style?: React.CSSProperties }> = ({ p, w, h, style }) => {
  if (p.photoFit) {
    const ih = p.photoFit.height;
    const iw = (1035 * ih) / 690;
    return (
      <div style={{ position: "absolute", width: w, height: h, overflow: "hidden", ...style }}>
        <Img src={staticFile(`people/${p.photo}.jpg`)} style={{ position: "absolute", left: w / 2 - iw * p.focusX, top: p.photoFit.top, width: iw, height: ih, maxWidth: "none" }} />
      </div>
    );
  }
  const k = Math.max(w / 1035, h / 690) * p.zoom;
  const iw = 1035 * k;
  const ih = 690 * k;
  const left = Math.min(0, Math.max(w - iw, w / 2 - iw * p.focusX));
  const top = Math.min(0, Math.max(h - ih, h / 2 - ih * p.focusY));
  return (
    <div style={{ position: "absolute", width: w, height: h, overflow: "hidden", ...style }}>
      <Img src={staticFile(`people/${p.photo}.jpg`)} style={{ position: "absolute", left, top, width: iw, height: ih, maxWidth: "none" }} />
    </div>
  );
};
export const Avatar: React.FC<{ photo: string; size: number; style?: React.CSSProperties }> = ({ photo, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, ...style }}>
    <Img src={staticFile(`people/${photo}_sq.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

// ---------- bottom nav (Bottom Nav v2, User = Boss) ----------
export const BottomNav: React.FC<{ selected: "talent" | "chats"; chatBadge?: number; me: string }> = ({ selected, chatBadge, me }) => {
  const tab = (i: number, icon: React.ReactNode, label: string, on: boolean, badge?: number) => (
    <div key={label} style={{ position: "absolute", left: 8 + 75.5 * i, top: 0, width: 75, height: 59 }}>
      <div style={{ position: "absolute", left: 0, top: 10, width: 75, height: 22, display: "flex", justifyContent: "center", alignItems: "center" }}>{icon}</div>
      <div style={{ position: "absolute", left: 0, top: 37, width: 75, textAlign: "center", ...inter(on ? 11 : 10, 14, on ? 600 : 500, on ? "#222222" : "#6A6A6A") }}>{label}</div>
      {badge ? (
        <div style={{ position: "absolute", left: 49, top: 4, minWidth: 16, height: 16, borderRadius: 8, background: "#D7251C", ...inter(11, 16, 500, "#fff"), textAlign: "center", padding: "0 4px", boxSizing: "border-box" }}>{badge}</div>
      ) : null}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 765, width: 393, height: 87, background: "rgba(255,255,255,0.97)", borderTop: "1px solid #EBEBEB", boxShadow: "0 -1px 12px rgba(0,0,0,0.02)", backdropFilter: "blur(30px)" }}>
      {tab(0, <IcTal w={32} color={selected === "talent" ? "#222222" : "#6A6A6A"} />, "Find talent", selected === "talent")}
      {tab(1, <IcWave />, "Reachouts", false)}
      {tab(2, <IcComment color={selected === "chats" ? "#222222" : "#6A6A6A"} />, "Chats", selected === "chats", chatBadge)}
      {tab(3, <IcSketch />, "Tal select", false)}
      {tab(4, <div style={{ width: 22, height: 22, borderRadius: 11, background: "#D7251C", display: "flex", alignItems: "center", justifyContent: "center" }}><Avatar photo={me} size={17} /></div>, "You", false)}
      <HomeIndicator top={74} />
    </div>
  );
};
export const HomeIndicator: React.FC<{ top: number }> = ({ top }) => <div style={{ position: "absolute", left: (393 - 134) / 2, top, width: 134, height: 5, borderRadius: 100, background: "#0B0B0D" }} />;

// ---------- Find talent (boss sees a candidate) ----------
const glass: React.CSSProperties = { background: "rgba(255,255,255,0.6)", borderRadius: 999, backdropFilter: "blur(20px)", boxShadow: "0 6px 24px rgba(0,0,0,0.04), 0 0 8px rgba(0,0,0,0.25)" };
const Q_STYLE = TS.sft(16, 24, 500);
const A_STYLE = TS.sfd(26, 36, 600);

/**
 * How far to scroll the profile so the prompt's answer and its Reply button sit just above the dock.
 * The prompt card starts at sheet y 268 (sheet at 497); the Reply button's bottom lands at y 651, 18 pt above the dock.
 * Two-line answers give 288, three-line answers 324. `scrollNudge` adds to it (the approved Tal Does scrolls Neha 36 further).
 */
export const answerScroll = (p: Candidate): number => {
  const block = blockHeight(p.question, 361, Q_STYLE) + 10 + blockHeight(p.answer, 361, A_STYLE) + 16 + 52;
  return Math.min(497 + 268 - 60, 497 + 268 + block - 651 + p.scrollNudge);
};

/** the profile scrolled by `scroll` points; `chatPress` is the dock pill's scale (1 = at rest) */
export const FindTalent: React.FC<{ p: Candidate; scroll: number; me: string; chatPress?: number; chatBadge?: number }> = ({ p, scroll, me, chatPress = 1, chatBadge = 3 }) => {
  const sy = (y: number) => y - scroll;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {/* hero photo 153..528, carousel dots, glass buttons */}
      <Photo p={p} w={393} h={375} style={{ left: 0, top: sy(153), background: "#FFF2E0" }} />
      <div style={{ position: "absolute", left: 16, top: sy(165), width: 40, height: 40, ...glass, display: "flex", alignItems: "center", justifyContent: "center" }}><IcUndo /></div>
      <div style={{ position: "absolute", left: 285, top: sy(165), width: 92, height: 40, ...glass, display: "flex", alignItems: "center", justifyContent: "space-around" }}><IcBookmark /><IcShare /></div>
      <div style={{ position: "absolute", left: 169, top: sy(461), display: "flex", gap: 4, alignItems: "center" }}>
        {[6, 6, 6, 4, 3].map((d, i) => <div key={i} style={{ width: d, height: d, borderRadius: 3, background: `rgba(255,255,255,${i === 0 ? 0.9 : 0.6})` }} />)}
      </div>
      {/* the page sheet */}
      <div style={{ position: "absolute", left: 0, top: sy(497), width: 393, height: 900, background: "#FFFFFF", borderRadius: "32px 32px 0 0", boxShadow: "0 -8px 16px rgba(0,0,0,0.10)" }}>
        <div style={{ position: "absolute", left: 16, top: 16, width: 361, textAlign: "center", ...cut(p.name, TS.sfd(22, 28, 600), 361), ...sfd(22, 28, 600, "#2C2C2E") }}>{p.name}</div>
        <div style={{ position: "absolute", left: 16, top: 46, width: 361, textAlign: "center", ...cut(`${p.title} at ${p.company}`, TS.sft(15, 22, 600), 361), ...sft(15, 22, 600, "#3F3F41") }}>{`${p.title} at ${p.company}`}</div>
        <div style={{ position: "absolute", left: 16, top: 70, width: 361, height: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
          <IcPin />
          <span style={{ ...cut(`${p.area}, ${p.city}`, TS.inter(13, 18, 500), 361 - 18), ...inter(13, 18, 500, "#6C6C70") }}>{`${p.area}, ${p.city}`}</span>
        </div>
        <div style={{ position: "absolute", left: 16, top: 102, width: 361, height: 1, background: "#EBEBEB" }} />
        {/* Row 3 */}
        {[
          { t: "Today", s: "Last seen", dot: true },
          { t: p.ctc, s: "CTC" },
          { t: p.years, s: "Experience" },
        ].map((c, i) => (
          <div key={i} style={{ position: "absolute", left: 131 * i, top: 124, width: 131, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, whiteSpace: "nowrap", ...sfd(14, 20, 600, "#2C2C2E") }}>
              {c.dot ? <div style={{ width: 4, height: 4, borderRadius: 2, background: "#13BF69" }} /> : null}
              {c.t}
            </div>
            <div style={{ marginTop: 2, ...sft(12, 16, 400, i === 0 ? "#48484A" : "#6C6C70") }}>{c.s}</div>
          </div>
        ))}
        {[131, 262].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 128, width: 1, height: 31, background: "#F5F5F8" }} />)}
        <div style={{ position: "absolute", left: 16, top: 184, width: 361, height: 1, background: "#EBEBEB" }} />
        {/* prompt card */}
        <div style={{ position: "absolute", left: 16, top: 268, width: 361 }}>
          <div style={sft(16, 24, 500, "#6C6C70")}>{p.question}</div>
          <div style={{ marginTop: 10, ...sfd(26, 36, 600, "#2C2C2E") }}>{p.answer}</div>
          <div style={{ marginTop: 16, height: 52, borderRadius: 999, background: "#F5F5F8", border: "1px solid #E5E5EA", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...inter(13, 18, 500, "#222222") }}>Reply</div>
          <div style={{ marginTop: 12, height: 1, background: "#EBEBEB" }} />
        </div>
      </div>
      {/* the dock: X and one Chat Now */}
      <div style={{ position: "absolute", left: 16, top: 673, width: 68, height: 68, borderRadius: 34, background: "linear-gradient(180deg,#222222,#000000)", border: "1px solid rgba(255,255,255,0.2)", boxSizing: "border-box", boxShadow: "0 4px 20px rgba(128,128,128,0.2), 0 2px 8px rgba(0,0,0,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IcDockX />
      </div>
      <div style={{ position: "absolute", left: 135, top: 669, width: 242, height: 76, borderRadius: 38, background: "linear-gradient(180deg,#222222,#000000)", border: "1px solid rgba(255,255,255,0.2)", boxSizing: "border-box", boxShadow: "0 4px 20px rgba(128,128,128,0.2), 0 2px 8px rgba(0,0,0,0.16)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${chatPress})` }}>
        <IcComment size={24} color="#FFFFFF" />
        <span style={inter(18, 24, 600, "#FFFFFF")}>Chat Now</span>
      </div>
      <BottomNav selected="talent" chatBadge={chatBadge} me={me} />
    </AbsoluteFill>
  );
};

// ---------- Chat L2 (a conversation) ----------
export type Msg = { from: "them" | "me"; text?: string; time: string; kind?: "text" | "meet" | "typing"; at: number; meet?: { when: string; what: string }; /** takes over a typing bubble's slot of this height */ from0?: number };
export type Thread = { name: string; role: string; forRole: string; photo: string; msgs: Msg[]; chips?: string[]; /** a profile header at the start of a new chat */ intro?: { title: string; facts: string } };

/** messages up to this many characters sit on one line with the time beside them */
const SHORT = 26;
const BODY = TS.inter(16, 24, 400);
const MEET_LINE = TS.inter(14, 20, 400);
/** text width inside a bubble: mine are at most 300 wide, theirs 323 but squeezed to 321 by the avatar; 16 padding a side */
const TEXT_W = { me: 300 - 32, them: 361 - 32 - 8 - 32 } as const;

/** natural height of a bubble in app points, from the copy */
export const bubbleHeight = (m: Msg): number => {
  if (m.kind === "typing") return 40;
  if (m.kind === "meet" && m.meet) return 118 + blockHeight(m.meet.when, 268 - 24, MEET_LINE) + blockHeight(m.meet.what, 268, MEET_LINE);
  const text = m.text ?? "";
  if (text.length <= SHORT) return 40;
  return blockHeight(text, TEXT_W[m.from], BODY) + 2 + 12 + 16;
};
/** a growing bubble's max-height runs 0 -> cap with the spring; the cap is 260 unless the bubble is taller */
export const growCap = (h: number) => Math.max(260, h + 60);

const Bubble: React.FC<{ m: Msg; photo: string; f: number; grow?: boolean }> = ({ m, photo, f, grow }) => {
  const k = sp(f, m.at, 14, 300);
  if (f < m.at) return grow ? null : <div style={{ visibility: "hidden" }}><BubbleBody m={m} photo={photo} f={f} /></div>;
  const cap = grow ? growCap(bubbleHeight(m)) : 260;
  return (
    <div style={{ maxHeight: grow ? (m.from0 ?? 0) + Math.max(0, k) * (cap - (m.from0 ?? 0)) : undefined, overflow: grow ? "visible" : undefined, transform: `translateY(${(1 - k) * 24}px) scale(${0.92 + 0.08 * k})`, transformOrigin: m.from === "me" ? "100% 100%" : "0% 100%", opacity: Math.min(1, k * 2) }}>
      <BubbleBody m={m} photo={photo} f={f} />
    </div>
  );
};
const BubbleBody: React.FC<{ m: Msg; photo: string; f: number }> = ({ m, photo, f }) => {
  const me = m.from === "me";
  const timeStyle = inter(10, 12, 400, me ? "#D8D8DC" : "#48484A");
  let inner: React.ReactNode;
  if (m.kind === "typing") {
    inner = (
      <div style={{ display: "flex", gap: 5, padding: "8px 2px", alignItems: "center", height: 24 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: "#8E8E93", opacity: 0.35 + 0.65 * Math.max(0, Math.sin(((f - m.at) / 9 - i * 0.33) * Math.PI)) }} />)}
      </div>
    );
  } else if (m.kind === "meet" && m.meet) {
    inner = (
      <div style={{ width: 268, padding: "8px 0 0" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><IcCalendar size={30} color="#E9C46A" /></div>
        <div style={{ marginTop: 10, textAlign: "center", ...inter(16, 22, 600, "#FFFFFF") }}>Meet invite sent</div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, alignItems: "center", ...inter(14, 20, 400, "#E5E5EA") }}><IcCalendar size={16} color="#D8D8DC" />{m.meet.when}</div>
        <div style={{ marginTop: 4, textAlign: "center", ...inter(14, 20, 400, "#E5E5EA") }}>{m.meet.what}</div>
        <div style={{ marginTop: 6, textAlign: "right", ...timeStyle }}>{m.time}</div>
      </div>
    );
  } else {
    const short = (m.text ?? "").length <= SHORT;
    inner = short ? (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <div style={inter(16, 24, 400, me ? "#FFFFFF" : "#0B0B0D")}>{m.text}</div>
        <div style={{ ...timeStyle, paddingBottom: 3, whiteSpace: "nowrap" }}>{m.time}</div>
      </div>
    ) : (
      <div>
        <div style={inter(16, 24, 400, me ? "#FFFFFF" : "#0B0B0D")}>{m.text}</div>
        <div style={{ ...timeStyle, textAlign: "right", marginTop: 2 }}>{m.time}</div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
      {!me ? <Avatar photo={photo} size={32} /> : null}
      <div style={{ maxWidth: me ? 300 : 323, padding: "8px 16px", borderRadius: 20, background: me ? "#444448" : "rgba(244,242,236,0.95)", boxShadow: "inset 0 0 2px rgba(0,0,0,0.03)", boxSizing: "border-box" }}>{inner}</div>
    </div>
  );
};

/** `meetPress` scales the "Setup meet" action */
export const ChatL2: React.FC<{ t: Thread; f: number; meetPress?: number; anchor?: "top" | "bottom"; time?: string }> = ({ t, f, meetPress = 1, anchor = "top", time }) => {
  const actions: { x: number; w: number; icon: React.ReactNode; label: string }[] = [
    { x: 4, w: 84, icon: <IcCross />, label: "Close chat" },
    { x: 88, w: 115, icon: <IcFilePlus />, label: "Request resume" },
    { x: 195, w: 89, icon: <IcCalendar />, label: "Setup meet" },
    { x: 276, w: 116, icon: <IcWhatsapp />, label: "Request contact" },
    { x: 384, w: 129, icon: <IcComment size={24} color="#6C6C70" />, label: "Connect next boss" },
  ];
  const visible = t.msgs;
  // the header's second line: role · For: role. It is cut with an ellipsis only if it would run off the screen
  const HEAD_W = 393 - 88;
  const sub = TS.inter(12, 16, 400);
  const longRole = widthOf(t.role, sub) + 10 + widthOf(`For: ${t.forRole}`, sub) > HEAD_W;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {/* thread, top-anchored under the top bar */}
      {anchor === "top" ? <div style={{ position: "absolute", left: 0, top: 184, width: 393, textAlign: "center", paddingTop: 4, ...inter(12, 16, 500, "#8E8E93") }}>Today</div> : null}
      <div style={{ position: "absolute", left: 16, width: 361, display: "flex", flexDirection: "column", gap: 6, ...(anchor === "top" ? { top: 212 } : { bottom: 852 - 711 }) }}>
        {t.intro ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 18 }}>
            <Avatar photo={t.photo} size={72} style={{ boxShadow: "0 0 24px rgba(0,0,0,0.18)" }} />
            <div style={{ marginTop: 10, ...sfd(18, 24, 600, "#2C2C2E") }}>{t.name}</div>
            <div style={{ marginTop: 2, ...inter(13, 18, 400, "#6C6C70") }}>{t.intro.title}</div>
            <div style={{ marginTop: 2, ...inter(13, 18, 400, "#6C6C70") }}>{t.intro.facts}</div>
          </div>
        ) : null}
        {anchor === "bottom" ? <div style={{ textAlign: "center", paddingBottom: 4, ...inter(12, 16, 500, "#8E8E93") }}>Today</div> : null}
        {visible.map((m, i) => <Bubble key={i} m={m} photo={t.photo} f={f} grow={anchor === "bottom"} />)}
      </div>
      {/* top bar */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 393, height: 184, background: "#fff", borderBottom: "1px solid #EFEFF4", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
        <StatusBar font={SFT} time={time} />
        <IcBack style={{ position: "absolute", left: 8, top: 63 }} />
        <Avatar photo={t.photo} size={36} style={{ position: "absolute", left: 44, top: 63, boxShadow: "inset 0 0 2px rgba(0,0,0,0.16)" }} />
        <div style={{ position: "absolute", left: 88, top: 62, ...(widthOf(t.name, TS.inter(15, 22, 600)) > HEAD_W ? { maxWidth: HEAD_W, ...one } : {}), ...inter(15, 22, 600, "#1C1C1E") }}>{t.name}</div>
        <div style={{ position: "absolute", left: 88, top: 84, ...(longRole ? { maxWidth: HEAD_W, overflow: "hidden" } : {}), display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", ...inter(12, 16, 400, "#6C6C70") }}>
          <span style={longRole ? { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" } : undefined}>{t.role}</span>
          <span style={{ width: 2, height: 2, borderRadius: 1, background: "#8E8E93", ...(longRole ? { flexShrink: 0 } : {}) }} />
          <span style={longRole ? { flexShrink: 0 } : undefined}>For: {t.forRole}</span>
        </div>
        {actions.map((a, i) => (
          <div key={a.label} style={{ position: "absolute", left: a.x, top: 114, width: a.w, height: 64, transform: i === 2 ? `scale(${meetPress})` : undefined }}>
            <div style={{ position: "absolute", left: (a.w - 24) / 2, top: 8 }}>{a.icon}</div>
            <div style={{ position: "absolute", left: 0, top: 40, width: a.w, textAlign: "center", whiteSpace: "nowrap", ...inter(12, 16, 400, "#48484A") }}>{a.label}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 88, top: 130, width: 1, height: 32, background: "#EBEBEB" }} />
      </div>
      {/* composer */}
      <div style={{ position: "absolute", left: 0, top: 719, width: 393, height: 133, background: "rgba(255,255,255,0.94)", boxShadow: "0 -1px 2px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "absolute", left: 16, top: 9, display: "flex", gap: 8 }}>
          {(t.chips ?? ["Sounds good!", "Can we talk tomorrow?"]).map((c, i) => (
            <div key={i} style={{ height: 34, padding: "0 10px", borderRadius: 12, border: "1px solid #E5E5EA", boxSizing: "border-box", display: "flex", alignItems: "center", whiteSpace: "nowrap", background: "#fff", ...inter(13, 18, 400, "#48484A") }}>{c}</div>
          ))}
        </div>
        <IcPlusBtn style={{ position: "absolute", left: 16, top: 61 }} />
        <div style={{ position: "absolute", left: 68, top: 60, width: 309, height: 46, borderRadius: 999, border: "1px solid #E5E5EA", boxSizing: "border-box", background: "#fff" }}>
          <div style={{ position: "absolute", left: 16, top: 11, ...inter(15, 22, 400, "#8E8E93") }}>Message</div>
          <IcMic style={{ position: "absolute", left: 271, top: 11 }} />
        </div>
        <HomeIndicator top={120} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Chat screen (the list) ----------
export type Row = { name: string; role: string; preview: string; time: string; n?: number; photo: string };
const DM_H = 98;
const DMRow: React.FC<{ r: Row; theirs?: boolean; hl?: number }> = ({ r, theirs, hl = 0 }) => (
  <div style={{ position: "relative", width: 393, height: DM_H, background: hl ? `rgba(239,239,244,${hl})` : undefined }}>
    <Avatar photo={r.photo} size={50} style={{ position: "absolute", left: 16, top: 16, boxShadow: "0 0 24px rgba(0,0,0,0.18)" }} />
    <div style={{ position: "absolute", left: 76, top: 16, width: 263, ...(widthOf(r.name, TS.inter(15, 22, 600)) > 200 ? { ...one, width: 200 } : {}), ...inter(15, 22, 600, "#222222"), opacity: theirs ? 0.75 : 1 }}>{r.name}</div>
    <div style={{ position: "absolute", left: 76, top: 38, width: 263, ...cut(r.role, TS.inter(12, 16, 400), 263), ...inter(12, 16, 400, "#6A6A6A"), opacity: theirs ? 0.75 : 1 }}>{r.role}</div>
    <div style={{ position: "absolute", left: 76, top: 58, width: 263, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...inter(14, 20, 400, "#6A6A6A"), opacity: theirs ? 0.75 : 1 }}>{r.preview}</div>
    <div style={{ position: "absolute", right: 16, top: 18, ...inter(13, 18, theirs ? 400 : 500, theirs ? "#8E8E93" : "#12A139") }}>{r.time}</div>
    {!theirs && r.n ? <div style={{ position: "absolute", left: 359, top: 59, width: 18, height: 18, borderRadius: 9, background: "#1C1C1E", textAlign: "center", ...inter(12, 18, 500, "#fff") }}>{r.n}</div> : null}
    <div style={{ position: "absolute", left: 76, top: DM_H - 1, width: 301, height: 1, background: "#EBEBEB" }} />
  </div>
);

/**
 * mine: rows in "Your turn"; theirs: rows in "Their turn". `leaving` (row index in mine, 0..1) slides that row out to the
 * left and closes the gap under it. hl highlights a pressed row.
 */
export const ChatList: React.FC<{ tabs: { label: string; count: number | null }[]; mine: Row[]; theirs: Row[]; yourCount: number; theirCount: number; leaving?: { i: number; k: number }; hl?: { i: number; k: number }; chatBadge?: number; time?: string; me: string }> = ({ tabs, mine, theirs, yourCount, theirCount, leaving, hl, chatBadge, time, me }) => {
  let y = 158;
  const shown = yourCount;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <StatusBar font={SFT} time={time} />
      <IcBellOff style={{ position: "absolute", left: 8, top: 58 }} />
      <div style={{ position: "absolute", left: 0, top: 64, width: 393, textAlign: "center", ...sfd(20, 24, 600, "#48484A") }}>Chats</div>
      <IcSearch style={{ position: "absolute", left: 349, top: 58 }} />
      <div style={{ position: "absolute", left: 16, top: 110, display: "flex", gap: 8 }}>
        {tabs.map(({ label, count }, i) => (
          <div key={i} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: i === 0 ? "#2C2C2E" : "#EFEFF4", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", boxShadow: i === 0 ? "0 2px 8px rgba(0,0,0,0.16)" : undefined }}>
            <span style={inter(13, 18, 400, i === 0 ? "#fff" : "#3F3F3F")}>{label}</span>
            {count !== null ? <span style={inter(13, 18, 400, "#48484A")}>{`(${count})`}</span> : null}
          </div>
        ))}
      </div>
      {/* Your turn */}
      <div style={{ position: "absolute", left: 16, top: y + 12, width: 361, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={inter(14, 20, 600, "#2C2C2E")}>Your turn ({shown})</span>
        <IcChevDown />
      </div>
      {(() => {
        y += 33;
        const out: React.ReactNode[] = [];
        mine.forEach((r, i) => {
          let dx = 0;
          let h = DM_H;
          if (leaving && leaving.i === i) {
            dx = -393 * Math.min(1, leaving.k * 1.6);
            h = DM_H * (1 - interpolate(leaving.k, [0.45, 1], [0, 1], CL));
          }
          out.push(
            <div key={r.name + i} style={{ position: "absolute", left: dx, top: y, width: 393, height: DM_H, overflow: "visible" }}>
              <DMRow r={r} hl={hl && hl.i === i ? hl.k : 0} />
            </div>,
          );
          y += h;
        });
        const top = y;
        out.push(
          <div key="their-h" style={{ position: "absolute", left: 16, top: top + 16, width: 361, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={inter(14, 20, 600, "#2C2C2E")}>Their turn ({theirCount})</span>
            <IcChevDown />
          </div>,
        );
        theirs.forEach((r, j) => out.push(<div key={"t" + r.name + j} style={{ position: "absolute", left: 0, top: top + 40 + DM_H * j, width: 393 }}><DMRow r={r} theirs /></div>));
        return out;
      })()}
      <BottomNav selected="chats" chatBadge={chatBadge} me={me} />
    </AbsoluteFill>
  );
};

// ---------- push transition between two screens ----------
export const Push: React.FC<{ k: number; from: React.ReactNode; to: React.ReactNode; back?: boolean }> = ({ k, from, to, back }) => {
  if (k <= 0) return <>{from}</>;
  if (k >= 1) return <>{to}</>;
  const a = back ? 1 - k : k; // a = how far the "deeper" screen is in
  const under = back ? to : from;
  const over = back ? from : to;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-30 * a}%)` }}>{under}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${100 * (1 - a)}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,0.12)" }}>{over}</AbsoluteFill>
    </AbsoluteFill>
  );
};
