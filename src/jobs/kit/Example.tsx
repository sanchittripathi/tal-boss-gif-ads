// A plain working example of the plumbing (NOT a design to copy): fonts, a job from props, the logo tile, the Tal Boss mark.
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { CompanyLogo, ff, Fonts, FPS, H, MONO, pick, TalBossLogo, TOK, W } from ".";

const Example: React.FC<{ jobs: string[] }> = ({ jobs }) => {
  const [j] = pick(jobs);
  return (
    <Fonts use={["ObviouslyDemo-NarrowBlackItalic", "SF-Pro-Display-Semibold"]}>
      <AbsoluteFill style={{ background: TOK.ink, color: TOK.cream, padding: 72 }}>
        <CompanyLogo job={j} size={120} />
        <div style={{ fontFamily: ff("ObviouslyDemo-NarrowBlackItalic"), fontSize: 150, lineHeight: "138px", textTransform: "uppercase", marginTop: 40 }}>{j.title}</div>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.06em", marginTop: 40, color: TOK.g5 }}>EST. CTC</div>
        <div style={{ fontFamily: ff("SF-Pro-Display-Semibold"), fontSize: 64 }}>{j.ctc} · {j.exp} · {j.location}</div>
        <TalBossLogo height={120} tone="cream" style={{ position: "absolute", left: 72, bottom: 72 }} />
      </AbsoluteFill>
    </Fonts>
  );
};
export const exampleComp = <Composition id="J-kit-Example" component={Example} defaultProps={{ jobs: ["razorpay"] }} durationInFrames={1} fps={FPS} width={W} height={H} />;
