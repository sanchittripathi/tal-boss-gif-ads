// "Role sets": the folder template with the counter headline ("#21 of 217 active PM roles on tal BOSS").
// One set = one function x level x company type. Statics show 1 or 3 roles; the GIF shows the roles one by one.
// No salary. Experience is optional (leave `exp` out and the card shows the location only).
import React from "react";
import { AbsoluteFill, Composition, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { blockHeight, Fonts, FPS, lineWidth } from "../kit";
import { C, CTA, FolderTab, FONT_FILES, fitSize, Label, OBV_BOLD, Pill, SF, TalMark, Value, WIDE } from "../classic/parts";
import sample from "./sample.json";

const SQ = 1080;
export const roleSchema = z.object({
  company: z.string(), title: z.string(), location: z.string(), exp: z.string().optional(),
  logo: z.string(), rank: z.number(),
});
export const setSchema = z.object({
  fn: z.string(),              // how the function reads in the headline: "PM", "engineering", "sales"
  total: z.number(),           // live roles in that function on the day of the pull
  audience: z.enum(["candidate", "boss"]).default("candidate"),
  roles: z.array(roleSchema),
});
type Role = z.infer<typeof roleSchema>;
type P = z.infer<typeof setSchema>;

// ---------- brand pieces ----------
/** "tal BOSS" as it is written on the creatives: the tal mark with BOSS in Obviously Bold caps on its baseline. */
const TalBoss: React.FC<{ height: number; color: string; style?: React.CSSProperties }> = ({ height, color, style }) => {
  const k = height / 64.6;
  return (
    <div style={{ position: "relative", width: 281 * k, height, ...style }}>
      <TalMark height={61 * k} color={color} style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ position: "absolute", left: 104.5 * k, bottom: 12 * k, fontFamily: OBV_BOLD, fontSize: 55.2 * k, lineHeight: `${42.9 * k}px`, height: 42.9 * k, color, textTransform: "uppercase", display: "flex", alignItems: "flex-end" }}>
        <span style={{ display: "block", lineHeight: 0.74 }}>Boss</span>
      </div>
    </div>
  );
};
/** The Tal Boss app icon (tile with tal over BOSS), as in the ad kit. */
const AppIcon: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => {
  const k = size / 247;
  return (
    <div style={{ position: "absolute", width: size, height: size, borderRadius: 55.3 * k, background: C.creamFolder, ...style }}>
      <TalMark height={90.5 * k} color={C.ink} style={{ position: "absolute", left: 47.6 * k, top: 57.8 * k }} />
      <div style={{ position: "absolute", left: 0, width: size, top: 158.1 * k, height: 35.6 * k, textAlign: "center", fontFamily: OBV_BOLD, fontSize: 45.74 * k, color: C.ink, textTransform: "uppercase" }}>
        <span style={{ display: "block", lineHeight: 0.74 }}>Boss</span>
      </div>
    </div>
  );
};
/** Obviously has no "#", and its upright "1" is a bare stem: draw both. */
const Glyphs: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {text.split(/([#1])/).map((p, i) =>
      p === "#" ? (
        <svg key={i} width={size * 0.66} height={size * 0.74} viewBox="0 0 66 74" style={{ display: "inline-block", verticalAlign: "baseline", marginRight: size * 0.06 }}>
          <path fill="currentColor" d="M22 0H34L28 74H16ZM46 0H58L52 74H40ZM4 18H66V30H4ZM0 44H62V56H0Z" />
        </svg>
      ) : p === "1" ? (
        <svg key={i} width={size * 0.44} height={size * 0.74} viewBox="0 0 44 74" style={{ display: "inline-block", verticalAlign: "baseline", margin: `0 ${size * 0.03}px` }}>
          <path fill="currentColor" d="M18 0H36V74H18V20L4 28V10Z" />
        </svg>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);
const num = (n: number) => n.toLocaleString("en-IN");
const wide = (t: string, max: number, width = 940) => Math.min(max, fitSize(t.replace("#", "H"), WIDE, 600, max, 20, width, 1, 1.1));

/** The headline: the counter, then tal BOSS large. One line when it fits; otherwise the count sits on its own line. */
const Counter: React.FC<{ lead: string; p: P; top: number; size: number; mark: number; gap?: number }> = ({ lead, p, top, size, mark, gap = 18 }) => {
  const a = `${lead} of ${num(p.total)}`, b = `active ${p.fn} on`;
  const one = wide(`${a} ${b}`, size);
  const two = one < size * 0.85;
  const sa = two ? size * 1.2 : one, sb = two ? wide(b, size * 0.86) : one;
  const m = two ? mark * 0.8 : mark;
  return (
    <div style={{ position: "absolute", top: two ? top - 16 : top, left: 0, width: SQ, display: "flex", flexDirection: "column", alignItems: "center", color: C.white }}>
      {(two ? [[a, sa], [b, sb]] as const : [[`${a} ${b}`, one]] as const).map(([t, z]) => (
        <div key={t} style={{ fontFamily: WIDE, fontSize: z, lineHeight: `${Math.round(z * 1.12)}px`, whiteSpace: "nowrap" }}><Glyphs text={t} size={z} /></div>
      ))}
      <div style={{ height: two ? gap * 0.75 : gap }} />
      <TalBoss height={m} color={C.white} />
    </div>
  );
};
const Logo: React.FC<{ role: Role; size: number }> = ({ role, size }) => (
  <Img src={staticFile(role.logo)} style={{ width: size, height: size, borderRadius: size * 0.2, objectFit: "cover", display: "block", boxShadow: "0 0 0 1px rgba(0,0,0,0.12)", flexShrink: 0 }} />
);
const Foot: React.FC<{ p: P; line?: boolean }> = ({ p, line }) => (
  <>
    <AppIcon size={88} style={{ left: 60, top: 962 }} />
    {line ? <div style={{ position: "absolute", left: 170, width: 600, top: 962, height: 88, display: "flex", alignItems: "center", fontFamily: SF("Semibold"), fontSize: 27, letterSpacing: "0.01em", color: C.creamFolder }}>{CTA[p.audience].caps}</div> : null}
    <Pill label={CTA[p.audience].pill} bg={C.creamFolder} fg={C.night} w={236} h={68} size={28} style={{ left: 784, top: 972 }} />
  </>
);

// ---------- one role ----------
const Card: React.FC<{ role: Role; p: P; style?: React.CSSProperties }> = ({ role, p, style }) => {
  const facts: [string, string][] = [...(role.exp ? [["Experience", role.exp] as [string, string]] : []), ["Location", role.location]];
  const t = fitSize(role.title, SF("Semibold"), 600, 84, 48, 860, 3, 1.04);
  return (
    <div style={{ position: "absolute", left: 72, top: 248, width: 936, height: 690, ...style }}>
      <FolderTab x={0} y={0} color={C.creamFolder} />
      <div style={{ position: "absolute", top: 34, width: 936, height: 656, background: C.creamFolder, borderRadius: "0 18px 18px 18px" }}>
        <div style={{ position: "absolute", left: 36, top: 34, width: 864 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Logo role={role} size={84} />
            <div style={{ fontFamily: SF("Semibold"), fontSize: 46, color: C.ink, whiteSpace: "nowrap" }}>{role.company}</div>
          </div>
          <div style={{ height: 38 }} />
          <div style={{ width: 864, fontFamily: SF("Semibold"), fontSize: t, lineHeight: `${Math.round(t * 1.04)}px`, color: C.ink, letterSpacing: "-0.01em" }}>{role.title}</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 428, width: 936, borderTop: `1px solid ${C.ink}`, borderBottom: `1px solid ${C.ink}`, padding: "22px 36px", boxSizing: "border-box", display: "flex", gap: 110 }}>
          {facts.map(([l, v]) => (
            <div key={l}>
              <Label size={22} color={C.ink} mono={false}>{l}</Label>
              <div style={{ height: 4 }} />
              <Value size={46} color={C.ink}>{v}</Value>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 583, width: 936, textAlign: "center", fontFamily: SF("Semibold"), fontSize: 28, letterSpacing: "0.01em", color: C.night }}>{CTA[p.audience].caps}</div>
      </div>
    </div>
  );
};
const SetS1: React.FC<P> = (p) => (
  <Fonts use={FONT_FILES}>
    <AbsoluteFill style={{ background: C.night }}>
      <Counter lead={`#${p.roles[0].rank}`} p={p} top={50} size={46} mark={104} />
      <Card role={p.roles[0]} p={p} />
      <Foot p={p} />
    </AbsoluteFill>
  </Fonts>
);

// ---------- three roles: one folder, three lines ----------
const SetS3: React.FC<P> = (p) => {
  const rs = p.roles.slice(0, 3);
  const RH = 226;
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.night }}>
        <Counter lead="3" p={p} top={44} size={38} mark={70} gap={14} />
        <div style={{ position: "absolute", left: 72, top: 206, width: 936 }}>
          <FolderTab x={0} y={0} color={C.creamFolder} />
          <div style={{ position: "absolute", top: 34, width: 936, height: RH * 3, background: C.creamFolder, borderRadius: "0 18px 18px 18px" }}>
            {rs.map((r, k) => {
              const one = Math.floor((52 * 716) / Math.max(716, lineWidth(r.title, SF("Semibold"), 52, 600)));
              const wrap = one < 42;
              const t = wrap ? fitSize(r.title, SF("Semibold"), 600, 42, 30, 716, 2, 1.1) : one;
              return (
                <div key={k} style={{ position: "absolute", left: 0, top: k * RH, width: 936, height: RH, borderTop: k ? `1px solid ${C.ink}` : "none", boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 36px", gap: 30 }}>
                  <Logo role={r} size={112} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SF("Medium"), fontSize: 30, color: C.body, whiteSpace: "nowrap" }}>{r.company}</div>
                    <div style={{ height: 4 }} />
                    <div style={{ fontFamily: SF("Semibold"), fontSize: t, lineHeight: `${Math.round(t * (wrap ? 1.1 : 1.12))}px`, color: C.ink, whiteSpace: wrap ? "normal" : "nowrap", width: 716, letterSpacing: "-0.01em" }}>{r.title}</div>
                    <div style={{ height: 8 }} />
                    <div style={{ fontFamily: SF("Medium"), fontSize: 28, color: C.body, whiteSpace: "nowrap" }}>{[r.location, r.exp].filter(Boolean).join("  ·  ")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Foot p={p} line />
      </AbsoluteFill>
    </Fonts>
  );
};

// ---------- GIF: the roles one by one; the counter changes with each ----------
const STEP = 54, MOVE = 12, END = 66;
export const setGifLen = (n: number) => n * STEP + END;
const SetG: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = p.roles.length;
  const i = Math.min(n - 1, Math.floor(f / STEP));
  const inK = i === 0 ? 1 : spring({ frame: f - i * STEP, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: MOVE });
  const endK = spring({ frame: f - n * STEP, fps, config: { damping: 200 }, durationInFrames: 14 });
  const prev = i > 0 ? p.roles[i - 1] : null;
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.night }}>
        <div style={{ opacity: 0.25 + 0.75 * inK }}><Counter lead={`#${p.roles[i].rank}`} p={p} top={50} size={46} mark={104} /></div>
        {prev && inK < 1 ? <Card role={prev} p={p} style={{ transform: `translateY(${-inK * 26}px) scale(${1 - inK * 0.04})`, opacity: 1 - inK * 0.6 }} /> : null}
        <Card role={p.roles[i]} p={p} style={{ transform: `translateY(${(1 - inK) * 760}px)` }} />
        <Foot p={p} />
        {f >= n * STEP ? (
          <AbsoluteFill style={{ background: C.night, opacity: endK, alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `translateY(${(1 - endK) * 30}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <AppIcon size={230} style={{ position: "relative" }} />
              <div style={{ height: 48 }} />
              <div style={{ fontFamily: WIDE, fontSize: wide(`${num(p.total)} active ${p.fn}`, 40, 960), color: C.white, whiteSpace: "nowrap" }}><Glyphs text={`${num(p.total)} active ${p.fn}`} size={wide(`${num(p.total)} active ${p.fn}`, 40, 960)} /></div>
              <div style={{ height: 18 }} />
              <div style={{ fontFamily: SF("Semibold"), fontSize: 36, color: C.creamFolder }}>{CTA[p.audience].line}</div>
              <div style={{ height: 44 }} />
              <Pill label={CTA[p.audience].pill} bg={C.creamFolder} fg={C.night} w={300} h={84} size={36} style={{ position: "relative" }} />
            </div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </Fonts>
  );
};

const d = setSchema.parse(sample);
export const comps: React.ReactNode = [
  <Composition key="s1" id="J-set-S1" component={SetS1} schema={setSchema} defaultProps={{ ...d, roles: d.roles.slice(0, 1) }} durationInFrames={1} fps={FPS} width={SQ} height={SQ} />,
  <Composition key="s3" id="J-set-S3" component={SetS3} schema={setSchema} defaultProps={{ ...d, roles: d.roles.slice(1, 4) }} durationInFrames={1} fps={FPS} width={SQ} height={SQ} />,
  <Composition key="g" id="J-set-G" component={SetG} schema={setSchema} defaultProps={d} durationInFrames={setGifLen(5)} fps={FPS} width={SQ} height={SQ}
    calculateMetadata={({ props }) => ({ durationInFrames: setGifLen(props.roles.length) })} />,
];
