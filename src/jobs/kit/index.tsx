// Shared kit for the "jobs are the ad" creatives. Every route (src/jobs/<persona>/) builds on this so the brand stays one brand.
// Canvas 1080 x 1350, 30 fps. A static is a 1-frame composition; a GIF is a normal composition.
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, Img, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import jobsData from "../data/jobs.json";

export { FPS, W, H } from "../../brand";
export { Logo as TalBossLogo, StoreBadges, InstallPill } from "../../kit/type";
export { lineWidth, blockHeight } from "../../kit/measure";

/** Brand colours. Use these and tints of them; a job's own brandColor may appear only as a small accent. */
export const TOK = {
  ink: "#0B0B0D", black: "#000000", white: "#FFFFFF",
  cream: "#FCF9DF", creamDeep: "#F5F3E1",
  yellow: "#FFD400", orange: "#FF5201",
  g1: "#1C1C1E", g2: "#2C2C2E", g3: "#48484A", g4: "#6C6C70", g5: "#A1A1A6",
};

// ---------- fonts ----------
const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], ignoreTooManyRequestsWarning: true });
const geistMono = loadGeistMono("normal", { weights: ["400", "500", "600", "700"], ignoreTooManyRequestsWarning: true });
export const INTER = inter.fontFamily;
/** Geist Mono: the small labels (EST. CTC, EXPERIENCE, LOCATION), as in the designers' templates. */
export const MONO = geistMono.fontFamily;

/**
 * Font files in public/fonts/, loaded by file name (without .otf). The CSS family is the same name.
 *   SF Pro (full character set, has the rupee sign): "SF-Pro-Display-Regular|Medium|Semibold|Bold|Heavy|Black", "SF-Pro-Text-Regular|Medium|Semibold|Bold"
 *   Obviously Narrow, licensed (full set EXCEPT the rupee sign): "Obviously-NarrowLight|NarrowMedium|NarrowSemibold|NarrowBold|NarrowSuper"
 *   Obviously demo cuts (ONLY A-Z a-z 0-9 full stop comma; nothing else, no rupee, no dash, no plus, no ampersand):
 *     "ObviouslyDemo-<Width><Weight><Italic>" with Width in "", Narrow, Condensed, Compressed, Wide, Extended;
 *     Weight in Thin, Light, Regular (written "" after a width, "Regular" with no width), Medium, Semibold, Bold, Black, Super; Italic optional.
 *     e.g. "ObviouslyDemo-WideBold", "ObviouslyDemo-NarrowBlackItalic", "ObviouslyDemo-CompressedSuper", "ObviouslyDemo-Bold".
 * Check a string with demoSafe() before setting it in a demo cut; set rupee amounts in SF Pro.
 */
const loaded = new Map<string, Promise<void>>();
const loadFile = (name: string): Promise<void> => {
  let p = loaded.get(name);
  if (!p) {
    p = (async () => {
      const res = await fetch(staticFile(`fonts/${name}.otf`));
      if (!res.ok) throw new Error(`Font file missing: public/fonts/${name}.otf`);
      const face = new FontFace(name, await res.arrayBuffer());
      await face.load();
      document.fonts.add(face);
    })();
    loaded.set(name, p);
  }
  return p;
};
/** CSS font-family for a font file loaded through <Fonts>. */
export const ff = (name: string) => `"${name}", ${INTER}, sans-serif`;
/** True when every character exists in the Obviously demo cuts. */
export const demoSafe = (text: string) => /^[A-Za-z0-9., \n]*$/.test(text);

/** Loads the named font files, Inter and Geist Mono, then renders its children. Wrap every composition in it. */
export const Fonts: React.FC<{ use: string[]; children: React.ReactNode }> = ({ use, children }) => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all([inter.waitUntilDone(), geistMono.waitUntilDone(), ...use.map(loadFile)]).then(() => live && setOk(true));
    return () => { live = false; };
  }, []);
  useEffect(() => { if (ok) continueRender(handle); }, [ok, handle]);
  return ok ? <>{children}</> : null;
};

// ---------- jobs ----------
export type Job = {
  id: string; slug: string;
  company: string;          // "Razorpay"
  title: string;            // cleaned for display: "Principal Data Scientist"
  titleAsPosted: string;
  function: string;         // Engineering | Data & AI | Product | Design | Marketing | Sales | Business | Leadership
  ctc: string;              // "₹69–115 LPA" (always label it "Est. CTC")
  ctcMin: number; ctcMax: number;
  exp: string;              // "6–9 yrs" or "10+ yrs"
  expMin: number; expMax: number;
  location: string;         // a Bengaluru locality, or "Bengaluru"
  city: string;
  workMode: string | null;
  about: string;            // one line about the company (may be long; trim it)
  posted: string;           // yyyy-mm-dd
  logo: string;             // path under public/
  logoBg: string;           // the logo tile's background colour
  brandColor: string;       // the logo's main colour
  small: boolean;           // true = the logo file is only 100 px; keep it under 100 px on screen
};
/** 52 real roles, live on Tal on 23 Nov 2026, each posted by a boss at that company. Never change a fact in them. */
export const JOBS = jobsData as Job[];
export const job = (slug: string): Job => {
  const j = JOBS.find((x) => x.slug === slug);
  if (!j) throw new Error(`No job with slug "${slug}". See src/jobs/data/jobs.json`);
  return j;
};
export const pick = (slugs: string[]): Job[] => slugs.map(job);
/** Platform facts on 23 Nov 2026 (real, from the database). Round down when quoting: "1,800+ roles", "1,100+ companies". */
export const FACTS = { liveRoles: 1807, companies: 1157, blrRoles: 1183, blrCompanies: 771, newThisWeek: 272, bosses: 6000 };

/** The company's logo as a rounded tile, as the app shows it. */
export const CompanyLogo: React.FC<{ job: Job; size: number; radius?: number; style?: React.CSSProperties }> = ({ job, size, radius, style }) => (
  <Img src={staticFile(job.logo)} style={{ width: size, height: size, borderRadius: radius ?? size * 0.22, display: "block", objectFit: "cover", ...style }} />
);
