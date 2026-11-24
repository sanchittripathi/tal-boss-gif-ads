// Sanchit's New Era templates as data-driven statics and GIFs. Four families, each as S1 (1 role), S3 (3 roles), G5 (5 roles):
//   stamp  = "Boss from X is hiring" over a perforated cream stamp (his T2; T1 = the badge variant, S1 only)
//   folder = the cream folder with a tab on near-black (his T3)
//   hiring = the black HIRING frame on cream (his T4)
//   photo  = the black-and-white photo with a role card (his Snabbit card), no boss face
import React from "react";
import { AbsoluteFill, Composition, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fonts, FPS, Job, pick } from "../kit";
import {
  About, aboutFits, C, CompanyRow, CTA, Facts, FolderTab, FONT_FILES, fitSize, HIRING_FRAME, Label, LogoCircle, NARROW, OBV_BOLD,
  oneLineSize, Pill, SF, Stamp, TalMark, Value, WIDE, WithOnes, type Audience,
} from "./parts";

type P = { jobs: string[]; audience?: Audience };
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SQ = 1080;

// ---------- shared ----------
const hiringHeadline = (j: Job) => `BOSS FROM ${j.company.toUpperCase()}\nIS HIRING`;
const groupHeadline = (js: Job[]) => `BOSSES FROM ${js.slice(0, -1).map((j) => j.company.toUpperCase()).join(", ")} AND ${js[js.length - 1].company.toUpperCase()} ARE HIRING`;
const anA = (title: string) => (/^([AEIOU]|(F|H|L|M|N|R|S|X)[A-Z]{1,3}\b)/.test(title) ? "AN" : "A");

/** Wide caps headline, centred, up to 2 lines, fitted to the width. */
const Headline: React.FC<{ text: string; top: number; max: number; color: string; width?: number; style?: React.CSSProperties }> = ({ text, top, max, color, width = 960, style }) => {
  const lines = text.split("\n");
  const size = Math.min(...lines.map((l) => fitSize(l, WIDE, 600, max, 26, width, lines.length > 1 ? 1 : 2, 1.04)));
  return (
    <div style={{ position: "absolute", top, left: (SQ - width) / 2, width, textAlign: "center", fontFamily: WIDE, fontSize: size, lineHeight: `${Math.round(size * 1.04)}px`, color, whiteSpace: "pre-line", ...style }}>{text}</div>
  );
};

/** The role title in SF Pro Semibold, fitted to `lines`. */
const Title: React.FC<{ text: string; width: number; max: number; min?: number; lines: number; color: string; lh?: number }> = ({ text, width, max, min = 30, lines, color, lh = 1.07 }) => {
  const s = fitSize(text, SF("Semibold"), 600, max, min, width, lines, lh);
  return <div style={{ width, fontFamily: SF("Semibold"), fontSize: s, lineHeight: `${Math.round(s * lh)}px`, color }}>{text}</div>;
};

/** Compact role for S3 rows: company, title on one line, facts inline. */
const Row: React.FC<{ job: Job; width: number; color: string; muted: string; tile?: number }> = ({ job, width, color, muted, tile = 52 }) => {
  const t = oneLineSize(job.title, SF("Semibold"), 600, 44, width);
  return (
    <div style={{ width }}>
      <CompanyRow job={job} tile={tile} size={30} color={color} weight="Medium" gap={16} />
      <div style={{ height: 12 }} />
      <div style={{ fontFamily: SF("Semibold"), fontSize: t, lineHeight: `${Math.round(t * 1.1)}px`, color, whiteSpace: "nowrap" }}>{job.title}</div>
      <div style={{ height: 12 }} />
      <div style={{ display: "flex", gap: 34, alignItems: "baseline" }}>
        {([["Est. CTC", job.ctc], ["Experience", job.exp], ["Location", job.location]] as const).map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <Label size={18} color={muted}>{l}</Label>
            <Value size={30} color={color}>{v}</Value>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Moves for the GIFs: role i is on screen from STEP*i; the change takes MOVE frames; the end card follows. */
const STEP = 54, MOVE = 12, END = 66;
const g5Len = (n: number) => n * STEP + END;
const useRole = (n: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(n - 1, Math.floor(f / STEP));
  const local = f - i * STEP;
  const inK = i === 0 ? 1 : spring({ frame: local, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: MOVE });
  const endAt = n * STEP;
  const outK = interpolate(f, [ (i + 1) * STEP - 2, (i + 1) * STEP + MOVE - 4], [0, 1], CL); // leaving towards the next role
  const endK = spring({ frame: f - endAt, fps, config: { damping: 200 }, durationInFrames: 14 });
  return { f, i, inK, outK: i === n - 1 ? interpolate(f, [endAt - 2, endAt + 8], [0, 1], CL) : outK, endK, ended: f >= endAt };
};

const EndCard: React.FC<{ k: number; bg: string; fg: string; pillBg: string; pillFg: string; audience: Audience }> = ({ k, bg, fg, pillBg, pillFg, audience }) => (
  <AbsoluteFill style={{ background: bg, opacity: k, alignItems: "center", justifyContent: "center" }}>
    <div style={{ transform: `translateY(${(1 - k) * 30}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <TalMark height={150} color={fg} />
      <div style={{ height: 44 }} />
      <div style={{ fontFamily: SF("Semibold"), fontSize: 40, color: fg }}>{CTA[audience].line}</div>
      <div style={{ height: 44 }} />
      <Pill label={CTA[audience].pill} bg={pillBg} fg={pillFg} w={300} h={84} size={36} style={{ position: "relative" }} />
    </div>
  </AbsoluteFill>
);

// =====================================================================================
// STAMP (his T2: headline, perforated stamp, caps CTA line, tal mark, cream pill)
// =====================================================================================
const StampCard: React.FC<{ job: Job; style?: React.CSSProperties }> = ({ job, style }) => {
  return (
    <Stamp w={836} h={561} color={C.cream} style={{ left: 122, top: 262, ...style }}>
      <div style={{ position: "absolute", left: 50, top: 46, width: 736 }}>
        <CompanyRow job={job} tile={64} size={42} color={C.ink} weight="Medium" />
        <div style={{ height: 30 }} />
        <Title text={job.title} width={736} max={aboutFits(job, 736, 27, 35, 2, "Medium") ? 60 : 74} lines={2} color={C.ink} />
        <About job={job} width={736} size={27} lh={35} lines={2} color={C.body} weight="Medium" style={{ marginTop: 20 }} />
      </div>
      <div style={{ position: "absolute", left: 50, bottom: 40 }}>
        <Facts job={job} width={736} label={18} value={38} color={C.ink} rule={C.ink} />
      </div>
    </Stamp>
  );
};
const StampFoot: React.FC<{ audience: Audience; caps?: boolean }> = ({ audience, caps = true }) => (
  <>
    {caps ? <div style={{ position: "absolute", top: 880, width: SQ, textAlign: "center", fontFamily: SF("Semibold"), fontSize: 32, color: C.white, letterSpacing: "0.01em" }}>{CTA[audience].caps}</div> : null}
    <TalMark height={56} color={C.cream} style={{ position: "absolute", left: 60, top: 972 }} />
    <Pill label={CTA[audience].pill} bg={C.cream} fg={C.night} w={270} h={73} size={30} style={{ left: 750, top: 964 }} />
  </>
);
const StampS1: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const [j] = pick(jobs);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.ink }}>
        <Headline text={hiringHeadline(j)} top={84} max={50} color={C.white} />
        <StampCard job={j} />
        <StampFoot audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
/** His T1: no headline, tal mark top-left, the orange perforated badge on the stamp's corner, pill bottom-left. */
const StampBadgeS1: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const [j] = pick(jobs);
  const line = audience === "candidate" ? ["Reach hiring", "managers in", "24h."] : ["Bosses", "hire here", "directly."];
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.ink }}>
        <TalMark height={64} color={C.cream} style={{ position: "absolute", left: 60, top: 56 }} />
        <StampCard job={j} style={{ left: 112, top: 232 }} />
        <Stamp w={212} h={152} color={C.orange} r={9.1} pitch={28.5} style={{ left: 820, top: 742 }}>
          <div style={{ position: "absolute", left: 26, top: 26, fontFamily: SF("Medium"), fontSize: 27, lineHeight: "31px", color: C.cream }}>
            {line[0]}<br />{line[1]}<br /><span style={{ fontFamily: SF("Bold") }}>{line[2]}</span>
          </div>
        </Stamp>
        <Pill label={CTA[audience].pill} bg={C.cream} fg={C.ink} w={250} h={70} size={32} style={{ left: 60, top: 946 }} />
      </AbsoluteFill>
    </Fonts>
  );
};
const StampS3: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 3);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.ink }}>
        <Headline text={groupHeadline(js)} top={56} max={40} color={C.white} width={980} />
        {js.map((j, k) => (
          <Stamp key={j.id} w={936} h={232} color={C.cream} r={9} pitch={30} style={{ left: 72, top: 190 + k * 250 }}>
            <div style={{ position: "absolute", left: 44, top: 30 }}><Row job={j} width={848} color={C.ink} muted={C.body} /></div>
          </Stamp>
        ))}
        <TalMark height={52} color={C.cream} style={{ position: "absolute", left: 72, top: 978 }} />
        <Pill label={CTA[audience].pill} bg={C.cream} fg={C.night} w={250} h={68} size={28} style={{ left: 758, top: 970 }} />
      </AbsoluteFill>
    </Fonts>
  );
};
const StampG5: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 5);
  const { i, inK, outK, endK, ended } = useRole(js.length);
  const j = js[i];
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.ink }}>
        <div style={{ opacity: inK * (1 - outK) }}><Headline text={hiringHeadline(j)} top={84} max={50} color={C.white} /></div>
        <StampCard job={j} style={{ opacity: Math.min(1, inK * 1.4) * (1 - outK), transform: `translateY(${(1 - inK) * 90 - outK * 90}px) scale(${1 + (1 - inK) * 0.03})` }} />
        <StampFoot audience={audience} />
        {ended ? <EndCard k={endK} bg={C.ink} fg={C.cream} pillBg={C.cream} pillFg={C.night} audience={audience} /> : null}
      </AbsoluteFill>
    </Fonts>
  );
};

// =====================================================================================
// FOLDER (his T3: near-black, headline, cream folder with tab, dark pill)
// =====================================================================================
const FolderCard: React.FC<{ job: Job; top?: number; style?: React.CSSProperties; audience: Audience }> = ({ job, top = 220, style, audience }) => {
  return (
    <div style={{ position: "absolute", left: 78, top, width: 936, height: 732, ...style }}>
      <FolderTab x={0} y={0} color={C.creamFolder} />
      <div style={{ position: "absolute", top: 34, width: 936, height: 698, background: C.creamFolder, borderRadius: "0 18px 18px 18px" }}>
        <div style={{ position: "absolute", left: 28, top: 30, width: 860 }}>
          <CompanyRow job={job} tile={84} size={46} color={C.ink} />
          <div style={{ height: 36 }} />
          <Title text={job.title} width={860} max={aboutFits(job, 860, 31, 43, 2) ? 59 : 76} lines={2} color={C.ink} lh={1.0} />
          <About job={job} width={860} size={31} lh={43} lines={2} color={C.body} style={{ marginTop: 24 }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 459 }}>
          <Facts job={job} width={936} label={22} value={46} color={C.ink} rule={C.ink} mono={false} pad={22} inset={28} />
        </div>
        <div style={{ position: "absolute", top: 640, width: 936, textAlign: "center", fontFamily: SF("Semibold"), fontSize: 28, color: C.night }}>{CTA[audience].caps}</div>
      </div>
    </div>
  );
};
const FolderFoot: React.FC<{ audience: Audience }> = ({ audience }) => (
  <>
    <TalMark height={56} color={C.creamFolder} style={{ position: "absolute", left: 50, top: 994 }} />
    <Pill label={CTA[audience].pill} bg={C.pillDark} fg={C.white} w={210} h={58} size={23} style={{ left: 806, top: 994, boxShadow: `0 0 0 1px ${C.body}` }} />
  </>
);
const FolderS1: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const [j] = pick(jobs);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.night }}>
        <Headline text={hiringHeadline(j)} top={68} max={53} color={C.white} />
        <FolderCard job={j} audience={audience} />
        <FolderFoot audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
/** Three folders filed one behind the other; their tabs step across like dividers. */
const FolderS3: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 3);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.night }}>
        <Headline text={groupHeadline(js)} top={52} max={40} color={C.white} width={980} />
        {js.map((j, k) => (
          <div key={j.id} style={{ position: "absolute", left: 78, top: 178 + k * 262, width: 936 }}>
            <FolderTab x={k * 293} y={0} color={C.creamFolder} />
            <div style={{ position: "absolute", top: 34, width: 936, height: 216, background: C.creamFolder, borderRadius: k === 0 ? "0 16px 16px 16px" : 16, boxShadow: "0 -1px 0 rgba(0,0,0,0.25)" }}>
              <div style={{ position: "absolute", left: 30, top: 24 }}><Row job={j} width={876} color={C.ink} muted={C.body} tile={50} /></div>
            </div>
          </div>
        ))}
        <FolderFoot audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
/** Each new folder is filed in front of the last: it rises from below, the one behind settles back. */
const FolderG5: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 5);
  const { i, inK, endK, ended } = useRole(js.length);
  const prev = i > 0 ? js[i - 1] : null;
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.night }}>
        <div style={{ opacity: inK }}><Headline text={hiringHeadline(js[i])} top={68} max={53} color={C.white} /></div>
        {prev && inK < 1 ? <FolderCard job={prev} audience={audience} style={{ transform: `translateY(${-inK * 26}px) scale(${1 - inK * 0.04})`, opacity: 1 - inK * 0.6 }} /> : null}
        <FolderCard job={js[i]} audience={audience} style={{ transform: `translateY(${(1 - inK) * 760}px)` }} />
        <FolderFoot audience={audience} />
        {ended ? <EndCard k={endK} bg={C.night} fg={C.creamFolder} pillBg={C.creamFolder} pillFg={C.night} audience={audience} /> : null}
      </AbsoluteFill>
    </Fonts>
  );
};

// =====================================================================================
// HIRING (his T4: cream page in the black HIRING frame)
// =====================================================================================
const HiringFrame: React.FC<{ audience: Audience }> = ({ audience }) => (
  <>
    <svg width={SQ} height={SQ} viewBox="0 -2 1080 1082" style={{ position: "absolute", inset: 0 }}><path d={HIRING_FRAME} fill={C.black} /></svg>
    <div style={{ position: "absolute", left: 40, top: 66, fontFamily: SF("Bold"), fontSize: 120, lineHeight: "120px", color: "#FCF7D9", letterSpacing: "-0.01em" }}>HIRING</div>
    <TalMark height={71} color={C.black} style={{ position: "absolute", left: 870, top: 89 }} />
    <div style={{ position: "absolute", right: 52, top: 948, textAlign: "right", fontFamily: SF("Regular"), fontSize: 40, lineHeight: "46px", color: C.cream }}>
      {audience === "candidate" ? <>Reach hiring managers<br />in <b style={{ fontFamily: SF("Bold"), fontWeight: 700 }}>24h.</b></> : <>The app where bosses<br /><b style={{ fontFamily: SF("Bold"), fontWeight: 700 }}>hire directly.</b></>}
    </div>
    <Pill label={CTA[audience].pill} bg={C.black} fg="#F7F5E0" w={317} h={86} size={35} style={{ left: 114, top: 907 }} />
  </>
);
const HiringBody: React.FC<{ job: Job; style?: React.CSSProperties }> = ({ job, style }) => {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: SQ, height: 880, ...style }}>
      <div style={{ position: "absolute", left: 92, top: 270, width: 880 }}>
        <CompanyRow job={job} tile={67} size={46} color={C.ink} />
        <div style={{ height: 40 }} />
        <Title text={job.title} width={880} max={aboutFits(job, 880, 31, 43, 2) ? 61 : 78} lines={2} color={C.ink} lh={1.0} />
        <About job={job} width={880} size={31} lh={43} lines={2} color={C.body} style={{ marginTop: 26 }} />
      </div>
      <div style={{ position: "absolute", left: 69, top: 700 }}>
        <Facts job={job} width={937} label={22} value={46} color={C.black} rule={C.ink} mono={false} pad={20} inset={23} order={["ctc", "loc", "exp"]} />
      </div>
    </div>
  );
};
const HiringS1: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const [j] = pick(jobs);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.creamPage }}>
        <HiringBody job={j} />
        <HiringFrame audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
const HiringS3: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 3);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.creamPage }}>
        {js.map((j, k) => (
          <div key={j.id} style={{ position: "absolute", left: 92, top: 240 + k * 218, width: 900, borderTop: k ? `1px solid ${C.ink}` : "none", paddingTop: k ? 22 : 8 }}>
            <Row job={j} width={880} color={C.ink} muted={C.body} />
          </div>
        ))}
        <HiringFrame audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
const HiringG5: React.FC<P> = ({ jobs, audience = "candidate" }) => {
  const js = pick(jobs).slice(0, 5);
  const { i, inK, outK, endK, ended } = useRole(js.length);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.creamPage }}>
        <HiringBody job={js[i]} style={{ opacity: Math.min(1, inK * 1.3) * (1 - outK), transform: `translateY(${(1 - inK) * 60 - outK * 60}px)` }} />
        <HiringFrame audience={audience} />
        {ended ? <EndCard k={endK} bg={C.black} fg={C.cream} pillBg={C.cream} pillFg={C.black} audience={audience} /> : null}
      </AbsoluteFill>
    </Fonts>
  );
};

// =====================================================================================
// PHOTO (his Snabbit card: black-and-white photo, white role card, tal BOSS line). 1080 x 1350. No boss face.
// =====================================================================================
const PH = 1350;
const PhotoBg: React.FC = () => (
  <>
    <Img src={staticFile("brand/newera-photo.jpg")} style={{ position: "absolute", inset: 0, width: SQ, height: PH, objectFit: "cover", filter: "grayscale(1)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);
const PhotoBrand: React.FC<{ audience: Audience }> = ({ audience }) => (
  <div style={{ position: "absolute", left: 0, top: 1176, width: SQ, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, color: C.white }}>
    <TalMark height={58} color={C.white} />
    <div style={{ fontFamily: OBV_BOLD, fontSize: 46, lineHeight: "46px", marginTop: 14 }}>BOSS</div>
    <div style={{ width: 2, height: 62, background: "rgba(255,255,255,0.6)", margin: "0 6px" }} />
    <div style={{ fontFamily: SF("Bold"), fontSize: 22, lineHeight: "26px", letterSpacing: "0.02em" }}>{audience === "boss" ? <>THE APP WHERE<br />BOSSES HIRE DIRECTLY</> : <>REACH HIRING<br />MANAGERS IN 24H</>}</div>
  </div>
);
const PhotoCard: React.FC<{ job: Job; style?: React.CSSProperties }> = ({ job, style }) => {
  const lead = `A BOSS AT ${job.company.toUpperCase()} IS HIRING ${anA(job.title)}`;
  const leadSize = Math.min(40, oneLineSize(lead, OBV_BOLD, 700, 40, 650));
  const tSize = fitSize(job.title.toUpperCase(), NARROW, 700, 92, 44, 780, 2, 0.96);
  return (
    <div style={{ position: "absolute", left: 120, top: 430, width: 840, background: "#FFFFFF", padding: "34px 30px 26px", boxShadow: "0 30px 80px rgba(0,0,0,0.35)", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: OBV_BOLD, fontSize: leadSize, lineHeight: `${Math.round(leadSize * 1.02)}px`, color: C.black, width: 650 }}>{lead}</div>
        <LogoCircle job={job} size={88} style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }} />
      </div>
      <div style={{ height: 50 }} />
      <div style={{ fontFamily: NARROW, fontSize: tSize, lineHeight: `${Math.round(tSize * 0.96)}px`, color: C.black, width: 780 }}><WithOnes text={job.title.toUpperCase()} size={tSize} /></div>
      <div style={{ height: 26 }} />
      <Facts job={job} width={780} label={20} value={38} color={C.black} rule={C.black} pad={16} />
    </div>
  );
};
const PhotoS1: React.FC<P> = ({ jobs, audience = "boss" }) => {
  const [j] = pick(jobs);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.black }}>
        <PhotoBg />
        <PhotoCard job={j} />
        <PhotoBrand audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
const PhotoS3: React.FC<P> = ({ jobs, audience = "boss" }) => {
  const js = pick(jobs).slice(0, 3);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.black }}>
        <PhotoBg />
        <div style={{ position: "absolute", left: 70, top: 230, width: 940, background: "#FFFFFF", padding: "34px 36px 30px", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>
          <div style={{ fontFamily: OBV_BOLD, fontSize: 36, color: C.black, marginBottom: 18 }}>BANGALORE BOSSES ARE HIRING</div>
          {js.map((j, k) => (
            <div key={j.id} style={{ borderTop: `1px solid ${C.black}`, padding: "22px 0 20px" }}><Row job={j} width={868} color={C.black} muted={C.body} /></div>
          ))}
        </div>
        <PhotoBrand audience={audience} />
      </AbsoluteFill>
    </Fonts>
  );
};
const PhotoG5: React.FC<P> = ({ jobs, audience = "boss" }) => {
  const js = pick(jobs).slice(0, 5);
  const { i, inK, outK, endK, ended } = useRole(js.length);
  return (
    <Fonts use={FONT_FILES}>
      <AbsoluteFill style={{ background: C.black }}>
        <PhotoBg />
        <PhotoCard job={js[i]} style={{ opacity: Math.min(1, inK * 1.4) * (1 - outK), transform: `translateY(${(1 - inK) * 80 - outK * 80}px)` }} />
        <PhotoBrand audience={audience} />
        {ended ? <EndCard k={endK} bg={C.black} fg={C.white} pillBg={C.white} pillFg={C.black} audience={audience} /> : null}
      </AbsoluteFill>
    </Fonts>
  );
};

// ---------- registration ----------
const D1 = ["razorpay"], D3 = ["razorpay", "swiggy", "cred"], D5 = ["razorpay", "swiggy", "cred", "zepto", "groww"];
const st = (id: string, c: React.FC<P>, jobs: string[], h = SQ) => <Composition key={id} id={id} component={c} defaultProps={{ jobs }} durationInFrames={1} fps={FPS} width={SQ} height={h} />;
const gf = (id: string, c: React.FC<P>, h = SQ) => <Composition key={id} id={id} component={c} defaultProps={{ jobs: D5 }} durationInFrames={g5Len(5)} fps={FPS} width={SQ} height={h} />;
export const comps: React.ReactNode = [
  st("J-classic-S1-stamp", StampS1, D1), st("J-classic-S1-badge", StampBadgeS1, D1), st("J-classic-S3-stamp", StampS3, D3), gf("J-classic-G5-stamp", StampG5),
  st("J-classic-S1-folder", FolderS1, D1), st("J-classic-S3-folder", FolderS3, D3), gf("J-classic-G5-folder", FolderG5),
  st("J-classic-S1-hiring", HiringS1, D1), st("J-classic-S3-hiring", HiringS3, D3), gf("J-classic-G5-hiring", HiringG5),
  st("J-classic-S1-photo", PhotoS1, D1, PH), st("J-classic-S3-photo", PhotoS3, D3, PH), gf("J-classic-G5-photo", PhotoG5, PH),
];
