// Ad typography (headlines, audience line) and the end card. Headlines auto-fit: a line that would run past
// the right margin shrinks the whole block, so longer copy never leaves the frame.
import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { DISPLAY, INTER, OBV, W } from "../brand";
import type { z } from "zod";
import type { zEndCard } from "../schema";
import { lineWidth } from "./measure";
import { CL, sp } from "./phone";

export type EndCard = z.infer<typeof zEndCard>;

/** right edge every headline and audience line must stay inside */
export const RIGHT_EDGE = W - 40;

// ---------- headlines ----------
export const display = (size: number, color: string): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: `${Math.round(size * 0.92)}px`, color, whiteSpace: "nowrap" });

/** the display cut only has these; anything else (? ! ' & -) is drawn in Obviously Narrow Bold, slanted and thickened */
const SAFE = /[A-Za-z0-9.,  ]/;
const BASE = 108; // the size the question mark was drawn at
type Run = { text: string; punct: boolean };
type Seg = { accent: boolean; runs: Run[] };

/** "IN *10 MINUTES.*" -> segments; text between stars takes the accent colour */
export const parse = (line: string): Seg[] =>
  line.split("*").map((part, i) => {
    const runs: Run[] = [];
    for (const ch of part) {
      const punct = !SAFE.test(ch);
      const last = runs[runs.length - 1];
      if (last && !last.punct && !punct) last.text += ch;
      else runs.push({ text: ch, punct });
    }
    return { accent: i % 2 === 1, runs };
  }).filter((s) => s.runs.length > 0);

const punctMargin = (ch: string, size: number) => (ch === "?" || ch === "!" ? (8 * size) / BASE : 0);

const Punct: React.FC<{ ch: string; size: number }> = ({ ch, size }) => (
  <span style={{ display: "inline-block", fontFamily: OBV, fontWeight: 700, transform: "skewX(-12deg)", WebkitTextStroke: `${(4 * size) / BASE}px currentColor`, marginLeft: punctMargin(ch, size) }}>{ch}</span>
);

/** width of a headline line at `size` */
export const headlineWidth = (line: string, size: number): number =>
  parse(line).reduce((sum, seg) => sum + seg.runs.reduce((a, r) => a + (r.punct ? lineWidth(r.text, OBV, size, 700) + punctMargin(r.text, size) : lineWidth(r.text, DISPLAY, size, 900)), 0), 0);

/** the largest size, up to `size`, at which every line fits in `maxWidth` */
export const fitHeadline = (lines: string[], size: number, maxWidth: number): number => {
  let s = size;
  for (const l of lines) {
    const w = headlineWidth(l, size);
    if (w > maxWidth) s = Math.min(s, (size * maxWidth) / w);
  }
  return s;
};

/** one headline line; `*stars*` mark the accent colour */
export const Headline: React.FC<{ line: string; size: number; color: string; accent: string; style?: React.CSSProperties }> = ({ line, size, color, accent, style }) => {
  const runs = (rs: Run[]) => rs.map((r, i) => (r.punct ? <Punct key={i} ch={r.text} size={size} /> : <React.Fragment key={i}>{r.text}</React.Fragment>));
  return (
    <div style={{ position: "absolute", ...style, ...display(size, color) }}>
      {parse(line).map((seg, i) => (seg.accent ? <span key={i} style={{ color: accent }}>{runs(seg.runs)}</span> : <React.Fragment key={i}>{runs(seg.runs)}</React.Fragment>))}
    </div>
  );
};

// ---------- audience line ----------
const AUD = 30;
/** "FOR CTOs OF BANGALORE", shown as typed; shrinks to fit `maxWidth` */
export const Audience: React.FC<{ color: string; top: number; children: string; left?: number; maxWidth?: number }> = ({ color, top, children, left = 72, maxWidth }) => {
  const max = maxWidth ?? RIGHT_EDGE - left;
  const w = lineWidth(children, INTER, AUD, 700, "0.04em");
  const size = w > max ? (AUD * max) / w : AUD;
  return <div style={{ position: "absolute", left: left - 2, top, fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: "30px", letterSpacing: "0.04em", color, whiteSpace: "nowrap" }}>{children}</div>;
};

// ---------- logo, pill, badges ----------
const LOGO_RATIO = 889 / 821;
/** tal BOSS stacked wordmark (889x821 png). tone = colour of the mark */
export const Logo: React.FC<{ height: number; tone: "cream" | "dark"; style?: React.CSSProperties }> = ({ height, tone, style }) => (
  <Img src={staticFile(`brand/tal-boss-wordmark-${tone}.png`)} style={{ height, width: (height * 889) / 821, ...style }} />
);
export const StoreBadges: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img src={staticFile("brand/badges-stores.png")} style={{ width, height: (width * 628) / 3840, ...style }} />
);
/** the "Install Now" pill: black on light grounds, white on dark */
export const InstallPill: React.FC<{ dark: boolean; label: string; style?: React.CSSProperties }> = ({ dark, label, style }) => (
  <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 36, padding: "22px 44px", borderRadius: 999, background: dark ? "#0B0B0C" : "#FFFFFF", color: dark ? "#FFFFFF" : "#0B0B0C", display: "inline-block", whiteSpace: "nowrap", ...style }}>{label}</div>
);

/** logo, Install pill and store badges; each pops in at its own frame */
export const EndStack: React.FC<{ f: number; at: number; logoTop: number; pillTop: number; badgesTop: number; end: EndCard; logoH?: number; left?: number }> = ({ f, at, logoTop, pillTop, badgesTop, end, logoH = 200, left }) => {
  const a = sp(f, at, 14, 220);
  const b = sp(f, at + 4, 14, 220);
  const c = sp(f, at + 7, 14, 220);
  const lift = (k: number) => ({ opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40}px)` });
  return (
    <>
      <Logo height={logoH} tone={end.logo} style={{ position: "absolute", top: logoTop, left: left ?? (W - logoH * LOGO_RATIO) / 2, ...lift(a) }} />
      <div style={{ position: "absolute", left: left ?? 0, top: pillTop, width: left === undefined ? W : undefined, display: "flex", justifyContent: left === undefined ? "center" : "flex-start", ...lift(b) }}>
        <InstallPill dark={end.pill === "dark"} label={end.installLabel} />
      </div>
      {end.storeBadges ? <StoreBadges width={420} style={{ position: "absolute", top: badgesTop, left: left ?? (W - 420) / 2, ...lift(c) }} /> : null}
    </>
  );
};
/** the small logo, top right, on every poster frame; it leaves when the end card's logo arrives */
export const CornerLogo: React.FC<{ tone: "cream" | "dark"; f: number; out: number }> = ({ tone, f, out }) => (
  <Logo height={64} tone={tone} style={{ position: "absolute", top: 48, left: 1008 - 64 * LOGO_RATIO, opacity: interpolate(f, [out, out + 6], [1, 0], CL) }} />
);
/** left edge of the corner logo, for lines that share its row */
export const CORNER_LOGO_LEFT = 1008 - 64 * LOGO_RATIO;
