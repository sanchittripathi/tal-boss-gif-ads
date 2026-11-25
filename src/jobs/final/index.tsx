// "Final" role-set look: Sanchit's finished Figma frames (Tal-DS, Creatives page, frame 1685:19643 + end card 1675:63507).
// One role card at a time on the dark gradient; the roles slide through, the "#N of total" counter rolls, then the end card.
//   J-final-G   the GIF (any number of roles; 3-5 reads best)
//   J-final-S1  the same frame as a static, first role only
// Data is the same shape as src/jobs/sets (setSchema), so any sets.json renders in this look.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Fonts, lineWidth, MONO } from "../kit";
import { CTA, fitSize, NARROW, SF, TalMark } from "../classic/parts";
import sample from "./sample.json";

const SQ = 1080;
/** 50 fps: the MP4 is very smooth, and the GIF takes every second frame (25 fps = an exact 4 cs GIF delay, no judder). */
export const FINAL_FPS = 50;
const s = (sec: number) => Math.round(sec * FINAL_FPS);

export const roleSchema = z.object({
  company: z.string(), title: z.string(), location: z.string(), exp: z.string().optional(),
  logo: z.string(), rank: z.number(),
});
export const finalSchema = z.object({
  fn: z.string(),              // reads in the headline after "active": "mid-level PM roles"
  total: z.number(),           // true count of live roles for that function x level on the day of the pull
  audience: z.enum(["candidate", "boss"]).default("candidate"),
  roles: z.array(roleSchema),
});
type Role = z.infer<typeof roleSchema>;
type P = z.infer<typeof finalSchema>;

const INK = "#1C1C1E", BODY = "#2C2C2E", CARD = "#F7F7F7", NIGHT = "#202021", CREAM = "#F5F3E1";
const FILES = ["SF-Pro-Display-Medium", "SF-Pro-Display-Semibold", "Obviously-NarrowBold"];
const num = (n: number) => n.toLocaleString("en-IN");
/** "2–4 yrs" -> "2 - 4 Years", as written on the final frame. */
const years = (exp: string) => exp.replace(/\s*[–-]\s*/, " - ").replace(/\s*yrs?\.?$/i, " Years");
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** SF Pro Expanded (end-card count line) comes from the variable SF-Pro.ttf; without the file it falls back to SF Pro Display. */
const useExpanded = () => {
  const [handle] = useState(() => delayRender("SF Pro Expanded"));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    fetch(staticFile("fonts/SF-Pro.ttf"))
      .then(async (r) => {
        if (!r.ok) return;
        const face = new FontFace("SF-Pro-Var", await r.arrayBuffer(), { weight: "100 900", stretch: "30% 150%" });
        await face.load();
        document.fonts.add(face);
        setOk(true);
      })
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
  return ok;
};

// ---------- pieces ----------
/** "#33 OF 1,006": the rank rolls upward when the role changes. `k` runs 0 -> 1 across the change. */
const Rank: React.FC<{ prev: number | null; cur: number; total: number; k: number }> = ({ prev, cur, total, k }) => {
  const size = 42.58, fam = SF("Medium");
  const w = (n: number) => lineWidth(num(n), fam, size, 500) + 1;
  const width = prev === null ? w(cur) : interpolate(k, [0, 1], [w(prev), w(cur)]);
  const line: React.CSSProperties = { position: "absolute", left: 0, top: 0, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", top: 54.8, left: 0, width: SQ, height: 44, display: "flex", justifyContent: "center", fontFamily: fam, fontSize: size, lineHeight: "44px", color: "#fff" }}>
      <span>#</span>
      <span style={{ position: "relative", width, height: 44, overflow: "hidden", display: "block" }}>
        {prev !== null && k < 1 ? <span style={{ ...line, transform: `translateY(${-k * 44}px)`, opacity: 1 - k }}>{num(prev)}</span> : null}
        <span style={{ ...line, transform: `translateY(${(1 - k) * 44}px)`, opacity: prev === null ? 1 : k }}>{num(cur)}</span>
      </span>
      <span style={{ whiteSpace: "pre" }}> OF {num(total)}</span>
    </div>
  );
};

/** "active senior PM roles on Tal Boss": SF Pro Display Medium 80, white fading to grey. "Tal Boss" never splits across lines. */
const Headline: React.FC<{ fn: string }> = ({ fn }) => {
  const text = `active ${fn} on Tal Boss`;
  const size = fitSize(text, SF("Medium"), 500, 80, 56, 996, 2, 1);
  return (
    <div style={{ position: "absolute", left: 42, top: 119, width: 996, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 996, textAlign: "center", fontFamily: SF("Medium"), fontSize: size, lineHeight: `${size}px`, backgroundImage: "linear-gradient(94deg, #FFFFFF 12%, #999999 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: 6, marginBottom: -6 }}>{text}</div>
    </div>
  );
};

/** Obviously's upright "1" is a bare stem and reads as an I ("PRODUCT MANAGER I"): draw a 1 with a flag. */
const Title: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {text.split(/(1)/).map((part, i) =>
      part === "1" ? (
        <svg key={i} width={size * 0.3} height={size * 0.715} viewBox="0 0 30 71.5" style={{ display: "inline-block", verticalAlign: "baseline", margin: `0 ${size * 0.02}px` }}>
          <path fill="currentColor" d="M13.5 0H28.5V71.5H13.5V19.5L1.5 26V11Z" />
        </svg>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 23.74, lineHeight: "35px", letterSpacing: "0.04em", textTransform: "uppercase", color: INK, whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ height: 13 }} />
    <div style={{ fontFamily: SF("Semibold"), fontSize: 40.69, lineHeight: "44px", color: BODY, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

/** The role card (931 wide, hugs its content). It is centred on y = 595, the middle of the space between headline and footer. */
const Card: React.FC<{ role: Role; style?: React.CSSProperties }> = ({ role, style }) => {
  const t = fitSize(role.title.toUpperCase(), NARROW, 700, 74, 54, 834, 3, 82 / 74);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: SQ, height: 1190, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <div style={{ width: 930.8, boxSizing: "border-box", padding: 48, borderRadius: 32, background: CARD, boxShadow: "1px 1px 2.3px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Img src={staticFile(role.logo)} style={{ width: 109.7, height: 109.7, borderRadius: 16.5, objectFit: "cover", display: "block", flexShrink: 0, boxShadow: "0 0 0 1.3px rgba(0,0,0,0.12), 0 0 16px rgba(71,71,71,0.3)" }} />
          <div style={{ fontFamily: SF("Semibold"), fontSize: 42, lineHeight: "50px", color: INK, whiteSpace: "nowrap" }}>{role.company}</div>
        </div>
        <div style={{ height: 38 }} />
        <div style={{ width: 834.8, fontFamily: NARROW, fontSize: t, lineHeight: `${Math.round((t * 82) / 74)}px`, textTransform: "uppercase", color: INK }}><Title text={role.title} size={t} /></div>
        <div style={{ height: 27 }} />
        <div style={{ height: 2.26, background: INK }} />
        <div style={{ height: 27 }} />
        <div style={{ display: "flex", gap: 48 }}>
          {role.exp ? <Fact label="Work Experience" value={years(role.exp)} /> : null}
          <Fact label="Location" value={role.location} />
        </div>
      </div>
    </div>
  );
};

/** Footer: the Tal Boss app icon (exported from the frame with its glass edge and shadow) and the light pill. */
const Foot: React.FC<{ label: string }> = ({ label }) => (
  <>
    <Img src={staticFile("brand/final-app-icon.png")} style={{ position: "absolute", left: 42 - 80, top: 920 - 80, width: 283.6, height: 283.6 }} />
    <div style={{ position: "absolute", left: 755, top: 943.8, width: 283, height: 76, borderRadius: 999, background: "linear-gradient(180deg, #EFEFF3, #FFFFFF)" }}>
      <div style={{ position: "absolute", inset: 3, borderRadius: 999, background: "linear-gradient(180deg, #F5F5F8, #E5E5EA)", boxShadow: "inset 0 2px 2px rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF("Medium"), fontSize: 25, color: INK }}>{label}</div>
    </div>
  </>
);

/** The flat app icon of the end card: white tile, tal over BOSS. */
const EndIcon: React.FC<{ size: number }> = ({ size }) => {
  const k = size / 247;
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 55.3 * k, background: "#fff" }}>
      <TalMark height={90.5 * k} color="#000" style={{ position: "absolute", left: 47.6 * k, top: 57.8 * k }} />
      <div style={{ position: "absolute", left: 0, width: size, top: 158.1 * k, height: 35.6 * k, textAlign: "center", fontFamily: '"ObviouslyDemo-Bold"', fontSize: 45.74 * k, color: "#000", textTransform: "uppercase" }}>
        <span style={{ display: "block", lineHeight: 0.74 }}>Boss</span>
      </div>
    </div>
  );
};

// ---------- timing ----------
const HOLD = s(1.9);   // one role on screen, including the slide that brings it in
const MOVE = s(0.7);   // the slide
const END = s(3.2);    // end card
const BACK = s(0.6);   // end card clears back to the first role, so the loop has no jump
export const finalLen = (n: number) => n * HOLD + END;

const Scene: React.FC<P & { f: number; expanded: boolean }> = (p) => {
  const { f } = p;
  const n = p.roles.length;
  const i = Math.min(n - 1, Math.floor(f / HOLD));
  const k = i === 0 ? 1 : interpolate(f - i * HOLD, [0, MOVE], [0, 1], { ...clamp, easing: ease });
  const prev = i > 0 ? p.roles[i - 1] : null;
  // end card: in after the last role, out again over the last BACK frames
  const e0 = n * HOLD;
  // The scene first dims to the flat end-card ground, then the end card rises in piece by piece. On the way back the pieces go first.
  const endIn = interpolate(f, [e0, e0 + s(0.34)], [0, 1], { ...clamp, easing: ease });
  const endOut = interpolate(f, [e0 + END - s(0.34), e0 + END], [1, 0], { ...clamp, easing: ease });
  const end = Math.min(endIn, endOut);
  const looping = f >= e0 + END - BACK;
  const leave = interpolate(f, [e0 + END - BACK, e0 + END - s(0.34)], [1, 0], clamp);
  const rise = (delay: number) => {
    const v = interpolate(f, [e0 + s(0.24 + delay), e0 + s(0.24 + delay + 0.7)], [0, 1], { ...clamp, easing: out });
    return { opacity: v * leave, transform: `translateY(${(1 - v) * 28}px)` };
  };
  const role = looping ? p.roles[0] : p.roles[i];
  const countLine = `${num(p.total)} active ${p.fn}`;
  const countFam = p.expanded ? '"SF-Pro-Var"' : SF("Semibold");
  return (
    <AbsoluteFill style={{ background: "#000", WebkitFontSmoothing: "antialiased" }}>
      <Img src={staticFile("brand/final-bg.png")} style={{ position: "absolute", inset: 0, width: SQ, height: SQ }} />
      <Rank prev={looping ? null : prev ? prev.rank : null} cur={role.rank} total={p.total} k={looping ? 1 : k} />
      <Headline fn={p.fn} />
      {prev && k < 1 && !looping ? (
        <Card role={prev} style={{ transform: `translateX(${-k * 1040}px) scale(${1 - k * 0.05})` }} />
      ) : null}
      <Card role={role} style={looping ? undefined : { transform: `translateX(${(1 - k) * 1040}px) scale(${0.95 + k * 0.05})` }} />
      <Foot label={p.audience === "boss" ? "Get the app" : "Join Tal"} />
      {end > 0 ? (
        <AbsoluteFill style={{ background: NIGHT, opacity: end }}>
          <div style={{ position: "absolute", left: 0, top: 282.5, width: SQ, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={rise(0)}><EndIcon size={230} /></div>
            <div style={{ height: 48 }} />
            <div style={{ ...rise(0.08), fontFamily: countFam, fontWeight: 600, fontStretch: "125%", fontVariationSettings: p.expanded ? '"wdth" 125, "wght" 590, "opsz" 28' : undefined, fontSize: Math.min(40, Math.floor((40 * 960) / Math.max(960, lineWidth(countLine, SF("Semibold"), 40, 600) * 1.22))), lineHeight: "48px", color: "#fff", whiteSpace: "nowrap" }}>{countLine}</div>
            <div style={{ height: 18 }} />
            <div style={{ ...rise(0.16), fontFamily: SF("Semibold"), fontSize: 36, lineHeight: "43px", color: CREAM, whiteSpace: "nowrap" }}>{CTA[p.audience].line}</div>
            <div style={{ height: 44 }} />
            <div style={{ ...rise(0.24), width: 300, height: 84, borderRadius: 42, background: "#FFFFFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF("Semibold"), fontSize: 36, color: NIGHT }}>{CTA[p.audience].pill}</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const FinalG: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const expanded = useExpanded();
  return <Fonts use={[...FILES, "ObviouslyDemo-Bold"]}><Scene {...p} f={f} expanded={expanded} /></Fonts>;
};
const FinalS1: React.FC<P> = (p) => <Fonts use={FILES}><Scene {...p} f={0} expanded={false} /></Fonts>;

const d = finalSchema.parse(sample);
export const comps: React.ReactNode = [
  <Composition key="g" id="J-final-G" component={FinalG} schema={finalSchema} defaultProps={d} durationInFrames={finalLen(d.roles.length)} fps={FINAL_FPS} width={SQ} height={SQ}
    calculateMetadata={({ props }) => ({ durationInFrames: finalLen(props.roles.length) })} />,
  <Composition key="s1" id="J-final-S1" component={FinalS1} schema={finalSchema} defaultProps={{ ...d, roles: d.roles.slice(0, 1) }} durationInFrames={1} fps={FINAL_FPS} width={SQ} height={SQ} />,
];
