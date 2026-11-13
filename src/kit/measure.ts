// Text measurement, so layout follows the copy. Call only inside <FontGate> (fonts must be loaded first).
import { measureText } from "@remotion/layout-utils";

export type TextStyle = { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: number; letterSpacing?: string };

const cache = new Map<string, number>();

/** height in px of `text` wrapped in a block `width` px wide, exactly as the browser lays it out */
export const blockHeight = (text: string, width: number, s: TextStyle): number => {
  const key = JSON.stringify([text, width, s]);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: "-20000px",
    top: "0px",
    visibility: "hidden",
    width: `${width}px`,
    fontFamily: s.fontFamily,
    fontSize: `${s.fontSize}px`,
    lineHeight: `${s.lineHeight}px`,
    fontWeight: String(s.fontWeight),
    letterSpacing: s.letterSpacing ?? "normal",
    whiteSpace: "normal",
  });
  el.textContent = text;
  document.body.appendChild(el);
  const h = Math.max(s.lineHeight, Math.round(el.getBoundingClientRect().height));
  document.body.removeChild(el);
  cache.set(key, h);
  return h;
};

/** single-line width in px */
export const lineWidth = (text: string, fontFamily: string, fontSize: number, fontWeight: number, letterSpacing?: string): number =>
  measureText({ text, fontFamily, fontSize, fontWeight, letterSpacing }).width;
