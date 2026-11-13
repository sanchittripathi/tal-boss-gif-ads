// Brand constants, fonts and the font gate. Canvas is 1080 x 1350 (4:5) at 30 fps.
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const FPS = 30;
export const W = 1080;
export const H = 1350;

/** The brand palette. These are the defaults for every colour prop. */
export const COL = { ink: "#0B0B0C", white: "#FFFFFF", yellow: "#FFD400", orange: "#FF5201" };

// ---------- fonts ----------
// Inter comes from Google Fonts. Obviously (headlines) and SF Pro (the app screens) are licensed and are not in the
// repo: put the .otf files in public/fonts/ (see README). If a file is missing we warn and fall back.
const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], ignoreTooManyRequestsWarning: true });
export const INTER = inter.fontFamily;

const LICENSED: { family: string; file: string; weight: string }[] = [
  { family: "Obviously Narrow", file: "ObviouslyNarrowBold.otf", weight: "700" },
  { family: "Obviously Narrow Black Italic", file: "ObviouslyNarrowBlackItalic.otf", weight: "900" },
  { family: "SF Pro Display R7", file: "SF-Pro-Display-Semibold.otf", weight: "600" },
  { family: "SF Pro Display R7", file: "SF-Pro-Display-Medium.otf", weight: "500" },
  { family: "SF Pro Display R7", file: "SF-Pro-Display-Regular.otf", weight: "400" },
  { family: "SF Pro Text R7", file: "SF-Pro-Text-Semibold.otf", weight: "600" },
  { family: "SF Pro Text R7", file: "SF-Pro-Text-Medium.otf", weight: "500" },
  { family: "SF Pro Text R7", file: "SF-Pro-Text-Regular.otf", weight: "400" },
];

/** Headline face (A-Z, a-z, 0-9, full stop and comma only; other characters are drawn in OBV, see Headline). */
export const DISPLAY = `"Obviously Narrow Black Italic", ${INTER}, sans-serif`;
/** Obviously Narrow Bold: has the punctuation the display cut lacks. */
export const OBV = `"Obviously Narrow", ${INTER}, sans-serif`;
/** SF Pro for the app screens; falls back to the system font, then Inter. */
export const SFD = `"SF Pro Display R7", -apple-system, BlinkMacSystemFont, ${INTER}, sans-serif`;
export const SFT = `"SF Pro Text R7", -apple-system, BlinkMacSystemFont, ${INTER}, sans-serif`;

const loadOptional = async ({ family, file, weight }: (typeof LICENSED)[number]): Promise<string | null> => {
  try {
    const res = await fetch(staticFile(`fonts/${file}`));
    if (!res.ok) throw new Error(String(res.status));
    const face = new FontFace(family, await res.arrayBuffer(), { weight });
    await face.load();
    document.fonts.add(face);
    return null;
  } catch {
    return file;
  }
};

let ready: Promise<void> | null = null;
/** resolves when Inter and every licensed font has loaded or been found missing */
export const fontsReady = (): Promise<void> => {
  if (!ready) {
    ready = Promise.all([inter.waitUntilDone(), Promise.all(LICENSED.map(loadOptional))]).then(([, missing]) => {
      const gone = missing.filter(Boolean);
      if (gone.length) {
        console.warn(`[tal-boss-gif-ads] Missing fonts in public/fonts/: ${gone.join(", ")}. Falling back to Inter / the system font. See README > Fonts.`);
      }
    });
  }
  return ready;
};

/** Renders its children only once the fonts are settled, so text measurement is done with the real fonts. */
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    fontsReady().then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (ok) continueRender(handle);
  }, [ok, handle]);
  return ok ? <>{children}</> : null;
};
