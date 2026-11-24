// "Classic" = Sanchit's own New Era templates (Figma Tal-DS, section 1537:71429), rebuilt as data-driven code.
// Brand: black / near-black grounds, cream cards, SF Pro for the role, Geist Mono for labels, tal wordmark.
// Measurements are taken from his frames (1080 square, 1049 for T1 scaled up). No slants, no italics, no new colours.
import React from "react";
import { Img, staticFile } from "remotion";
import { blockHeight, CompanyLogo, ff, Job, lineWidth, MONO } from "../kit";

export const C = {
  ink: "#0B0B0D", black: "#000000", night: "#202021",
  cream: "#FCF9DF", creamFolder: "#F5F3E1", creamPage: "#FAF8E1",
  body: "#2C2C2E", white: "#FFFFFF", orange: "#FF5201", pillDark: "#1C1C1E",
};

export const FONT_FILES = [
  "SF-Pro-Display-Regular", "SF-Pro-Display-Medium", "SF-Pro-Display-Semibold", "SF-Pro-Display-Bold",
  "ObviouslyDemo-WideSemibold", "ObviouslyDemo-Bold", "Obviously-NarrowBold",
];
export const SF = (w: "Regular" | "Medium" | "Semibold" | "Bold") => ff(`SF-Pro-Display-${w}`);
export const WIDE = ff("ObviouslyDemo-WideSemibold");
export const OBV_BOLD = ff("ObviouslyDemo-Bold");
export const NARROW = ff("Obviously-NarrowBold");

/** CTA copy. "candidate" is the copy on his Unosecur templates; "boss" is the copy on his phone and Snabbit templates. */
export type Audience = "candidate" | "boss";
export const CTA = {
  candidate: { pill: "Apply now", line: "Reach hiring managers in 24h.", caps: "REACH THE HIRING MANAGER IN 24H" },
  boss: { pill: "Install Now", line: "The app where bosses hire directly.", caps: "THE APP WHERE BOSSES HIRE DIRECTLY" },
};

/** The tal wordmark from his frames (104 x 64). */
export const TalMark: React.FC<{ height: number; color: string; style?: React.CSSProperties }> = ({ height, color, style }) => (
  <div style={{ width: (height * 104) / 64, height, color, ...style }}>
    <svg width="100%" height="100%" viewBox="0 0 104 64" fill="none">
      <path fill="currentColor" d="M37.26 50.44C37.26 42.02 43.33 36.45 55.96 36.45C60.67 36.45 65 36.82 69.09 37.31V33.6C69.09 31.7 68.95 29.75 68.34 27.94C67.88 26.57 67.11 25.3 65.94 24.42C64.97 23.69 63.79 23.28 62.61 23.04C61.34 22.78 59.99 22.66 58.72 22.95C57.47 23.24 56.33 23.91 55.45 24.85C54.18 26.19 53.48 27.98 53.06 29.75C52.9 30.4 52.79 31.06 52.7 31.71C52.67 31.9 52.44 33.84 52.49 33.85L37.88 31.86C39.12 18.12 48.04 11.3 61.54 11.3C78.01 11.3 84.2 19.23 84.2 32.85L84.08 49.45C84.08 54.9 84.2 58.49 84.45 62.7H68.72L70.45 49.08H69.59C67.73 56.64 61.54 63.69 51.63 63.69C42.96 63.69 37.26 58.99 37.26 50.44ZM69.09 45.36V41.65L60.17 41.52C54.72 41.52 52.12 43.88 52.12 46.97C52.12 50.07 54.48 51.93 57.82 51.93C62.28 51.93 65.75 49.82 69.09 45.36Z" />
      <path fill="currentColor" d="M29.79 11.22C27.43 11.39 25 11.58 22.58 11.59V0.1L21.51 0.18C16.46 0.57 12.57 0.65 7.55 0.65H6.55L6.62 11.55L0 10.9V21.42L6.66 20.61C6.79 26.18 6.72 33.33 6.68 38.58C6.65 41.28 6.63 43.82 6.63 46.03C6.63 58.48 11.78 63.79 23.85 63.79C27.47 63.79 31.21 63.37 34.38 62.59L35.11 62.42L35.58 50.05L34.36 50.28C31.47 50.81 29.16 51.04 26.66 51.04C23.91 50.7 22.58 48.75 22.58 45.09C22.58 43.2 22.56 40.91 22.54 38.4C22.49 33.51 22.42 26.16 22.55 20.5L36.02 21.31L36.6 10.83L35.52 10.87C33.59 10.93 31.66 11.08 29.79 11.22Z" />
      <path fill="currentColor" d="M103.4 30.31C103.34 22.64 103.46 15.53 103.59 8L103.59 7.87C103.63 5.65 103.67 3.39 103.71 1.08L103.73 0L87.35 1.07L87.4 4.31C87.55 13.23 87.68 21.66 87.68 30.94L87.52 62.51H103.79V59.24L103.4 30.31Z" />
    </svg>
  </div>
);

// ---------- shapes ----------
/** A perforated stamp outline (his "Subtract" shape): semicircle notches of radius r every `pitch` px on all four sides. */
export const stampPath = (w: number, h: number, r = 11.1, pitch = 36.3, margin = 14) => {
  const notches = (len: number) => {
    const n = Math.max(1, Math.floor((len - 2 * margin - 2 * r) / pitch) + 1);
    const span = (n - 1) * pitch;
    const start = (len - span) / 2;
    return Array.from({ length: n }, (_, i) => start + i * pitch);
  };
  const tx = notches(w), ty = notches(h);
  let d = `M0 0`;
  for (const cx of tx) d += ` L${cx - r} 0 A${r} ${r} 0 0 0 ${cx + r} 0`;
  d += ` L${w} 0`;
  for (const cy of ty) d += ` L${w} ${cy - r} A${r} ${r} 0 0 0 ${w} ${cy + r}`;
  d += ` L${w} ${h}`;
  for (const cx of [...tx].reverse()) d += ` L${cx + r} ${h} A${r} ${r} 0 0 0 ${cx - r} ${h}`;
  d += ` L0 ${h}`;
  for (const cy of [...ty].reverse()) d += ` L0 ${cy + r} A${r} ${r} 0 0 0 0 ${cy - r}`;
  return d + " Z";
};
export const Stamp: React.FC<{ w: number; h: number; color: string; r?: number; pitch?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ w, h, color, r, pitch, style, children }) => (
  <div style={{ position: "absolute", width: w, height: h, ...style }}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}><path d={stampPath(w, h, r, pitch)} fill={color} /></svg>
    {children}
  </div>
);

/** His folder tab (351 x 35 trapezoid), drawn at any width. */
export const FolderTab: React.FC<{ x: number; y: number; w?: number; color: string }> = ({ x, y, w = 350, color }) => (
  <svg width={w} height={35} style={{ position: "absolute", left: x, top: y }} viewBox={`0 0 ${w} 35`}>
    <path d={`M${(45.6 * w) / 350} 0L0 35L${w} 35L${w - 44.4} 0Z`} fill={color} />
  </svg>
);

/** His HIRING frame (the "Union" shape): black border with the HIRING tab top-left and the CTA notch bottom-right. 1080 square. */
export const HIRING_FRAME = "M554 -1C554 -0.45 554.45 0 555 0H1048C1065.67 0 1080 14.33 1080 32V1048C1080 1065.67 1065.67 1080 1048 1080H32C14.33 1080 0 1065.67 0 1048V30C0 12.33 14.33 -2 32 -2H553C553.55 -2 554 -1.55 554 -1ZM554 176C554 193.67 539.67 208 522 208H85C67.33 208 53 222.33 53 240V995C53 1012.67 67.33 1027 85 1027H467C484.67 1027 499 1012.67 499 995V951C499 933.33 513.33 919 531 919H995C1012.67 919 1027 904.67 1027 887V85C1027 67.33 1012.67 53 995 53H586C568.33 53 554 67.33 554 85V176Z";

export const Pill: React.FC<{ label: string; bg: string; fg: string; w: number; h: number; size: number; style?: React.CSSProperties }> = ({ label, bg, fg, w, h, size, style }) => (
  <div style={{ position: "absolute", width: w, height: h, borderRadius: h / 2, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF("Semibold"), fontSize: size, ...style }}>{label}</div>
);

// ---------- text helpers ----------
/** The company line, as his templates use it. Description: first full sentence only, never cut mid-word; dropped if too long. */
export const aboutLine = (j: Job, maxChars = 170): string | null => {
  const t = j.about.replace(/\s+/g, " ").trim();
  const m = t.match(/^.+?[.!?](\s|$)/);
  const s = (m ? m[0] : t).trim();
  if (s.length < 12 || s.length > maxChars) return null;
  if (!m && t.length >= 215) return null; // the stored text was cut at 220 chars and has no full sentence
  return s;
};

/** Largest size <= max at which `text` fits in `lines` lines of `width` (SF Pro Semibold). */
export const fitSize = (text: string, family: string, weight: number, max: number, min: number, width: number, lines: number, lhRatio: number) => {
  for (let s = max; s >= min; s -= 1) {
    const lh = Math.round(s * lhRatio);
    const h = blockHeight(text, width, { fontFamily: family, fontSize: s, lineHeight: lh, fontWeight: weight });
    if (h <= lh * lines + 1) return s;
  }
  return min;
};
export const oneLineSize = (text: string, family: string, weight: number, max: number, width: number) => {
  const w = lineWidth(text, family, max, weight);
  return w <= width ? max : Math.floor((max * width) / w);
};

/** Upright Obviously "1" is a bare stem that reads as I: swap every 1 for a drawn figure with a flag. */
export const WithOnes: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const parts = text.split("1");
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 ? (
            <svg width={size * 0.52} height={size * 0.74} viewBox="0 0 52 74" style={{ display: "inline-block", verticalAlign: "baseline", margin: `0 ${size * 0.02}px` }}>
              <path d="M22 0H38V74H22V18L8 26V10Z" fill="currentColor" />
            </svg>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
};

// ---------- the role, as his cards lay it out ----------
export const Label: React.FC<{ children: string; size: number; color: string; mono?: boolean }> = ({ children, size, color, mono = true }) => (
  <div style={{ fontFamily: mono ? MONO : SF("Semibold"), fontWeight: 600, fontSize: size, letterSpacing: "0.06em", textTransform: "uppercase", color, lineHeight: `${Math.round(size * 1.3)}px`, whiteSpace: "nowrap" }}>{children}</div>
);
export const Value: React.FC<{ children: string; size: number; color: string }> = ({ children, size, color }) => (
  <div style={{ fontFamily: SF("Semibold"), fontSize: size, color, lineHeight: `${Math.round(size * 1.2)}px`, whiteSpace: "nowrap" }}>{children}</div>
);

/** The facts row between two hairlines: EST. CTC · EXPERIENCE · LOCATION. */
export const Facts: React.FC<{ job: Job; width: number; label: number; value: number; color: string; rule: string; mono?: boolean; pad?: number; inset?: number; order?: ("ctc" | "exp" | "loc")[] }> = ({ job, width, label, value, color, rule, mono = true, pad = 14, inset = 0, order = ["ctc", "exp", "loc"] }) => {
  const cells = { ctc: ["Est. CTC", job.ctc], exp: ["Experience", job.exp], loc: ["Location", job.location] } as const;
  // value size shrinks together so the longest cell still fits its column
  const col = (width - 2 * inset - 40) / 3;
  const widest = Math.max(...order.map((k) => lineWidth(cells[k][1], SF("Semibold"), value, 600)));
  const v = widest > col ? Math.floor((value * col) / widest) : value;
  return (
    <div style={{ width, borderTop: `1px solid ${rule}`, borderBottom: `1px solid ${rule}`, padding: `${pad}px ${inset}px`, boxSizing: "border-box", display: "flex", justifyContent: "space-between" }}>
      {order.map((k) => (
        <div key={k} style={{ width: col }}>
          <Label size={label} color={color} mono={mono}>{cells[k][0]}</Label>
          <div style={{ height: 4 }} />
          <Value size={v} color={color}>{cells[k][1]}</Value>
        </div>
      ))}
    </div>
  );
};

/** Logo tile + company name, the first line of every card. */
export const CompanyRow: React.FC<{ job: Job; tile: number; size: number; color: string; weight?: "Medium" | "Semibold"; gap?: number }> = ({ job, tile, size, color, weight = "Semibold", gap = 20 }) => (
  <div style={{ display: "flex", alignItems: "center", gap }}>
    <CompanyLogo job={job} size={tile} radius={tile * 0.2} style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.12)" }} />
    <div style={{ fontFamily: SF(weight), fontSize: size, color, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{job.company}</div>
  </div>
);

/** Full-res company logo in a photo-card circle. */
export const LogoCircle: React.FC<{ job: Job; size: number; style?: React.CSSProperties }> = ({ job, size, style }) => (
  <Img src={staticFile(job.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", boxShadow: "0 0 0 2px #fff", ...style }} />
);

/** The company's one-line description: a full sentence that fits in `lines` lines at this size, or nothing. Never cut. */
export const About: React.FC<{ job: Job; width: number; size: number; lh: number; lines: number; color: string; weight?: "Regular" | "Medium"; style?: React.CSSProperties }> = ({ job, width, size, lh, lines, color, weight = "Regular", style }) => {
  const s = aboutLine(job, 400);
  if (!s) return null;
  const h = blockHeight(s, width, { fontFamily: SF(weight), fontSize: size, lineHeight: lh, fontWeight: weight === "Medium" ? 500 : 400 });
  if (h > lh * lines + 1) return null;
  return <div style={{ width, fontFamily: SF(weight), fontSize: size, lineHeight: `${lh}px`, color, ...style }}>{s}</div>;
};

/** True when the company sentence will be shown (same rule as <About>). */
export const aboutFits = (job: Job, width: number, size: number, lh: number, lines: number, weight: "Regular" | "Medium" = "Regular") => {
  const s = aboutLine(job, 400);
  if (!s) return false;
  return blockHeight(s, width, { fontFamily: SF(weight), fontSize: size, lineHeight: lh, fontWeight: weight === "Medium" ? 500 : 400 }) <= lh * lines + 1;
};
