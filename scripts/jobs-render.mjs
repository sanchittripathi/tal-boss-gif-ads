#!/usr/bin/env node
// Render a "jobs are the ad" composition.
//   node scripts/jobs-render.mjs J-classic-S1-stamp razorpay                          -> out/jobs/classic/J-classic-S1-stamp_razorpay.png (statics render a still)
//   node scripts/jobs-render.mjs J-classic-G5-stamp razorpay,swiggy,cred,zepto,groww  -> .mp4 + .gif (720 wide, 15 fps) + _f0.png (frame 0)
//   --name=<label> sets the file label, --frame=N also saves frame N of a GIF as PNG,
//   --audience=boss switches the CTA to the boss copy ("Install Now"); the default is the candidate copy ("Apply now").
// The slugs are passed to the composition as props { jobs: [...], audience }.
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [comp, slugArg] = args.filter((a) => !a.startsWith("--"));
if (!comp) { console.error("Usage: node scripts/jobs-render.mjs <compId> <slug[,slug...]> [--name=label] [--frame=N]"); process.exit(1); }
const slugs = slugArg ? slugArg.split(",") : [];
const persona = comp.split("-")[1];
const dir = join("out", "jobs", persona);
mkdirSync(dir, { recursive: true });
const label = flags.name ?? (slugs.length > 1 ? `${slugs[0]}+${slugs.length - 1}` : slugs[0] ?? "default");
const base = join(dir, `${comp}_${label}`);
const propObj = { ...(slugs.length ? { jobs: slugs } : {}), ...(flags.audience ? { audience: flags.audience } : {}) };
const props = Object.keys(propObj).length ? [`--props=${JSON.stringify(propObj)}`] : [];
const run = (cmd, argv) => { const r = spawnSync(cmd, argv, { stdio: "inherit" }); if (r.status !== 0) process.exit(r.status ?? 1); };
const isGif = /-G\d/.test(comp);
if (!isGif) {
  run("npx", ["remotion", "still", "src/index.ts", comp, `${base}.png`, ...props, "--log=error"]);
  console.log(`Done: ${base}.png`);
} else {
  run("npx", ["remotion", "render", "src/index.ts", comp, `${base}.mp4`, ...props, "--crf=16", "--log=error"]);
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", `${base}.mp4`, "-vf", "fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=200[p];[b][p]paletteuse=dither=bayer:bayer_scale=4", `${base}.gif`]);
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", `${base}.mp4`, "-vf", "select=eq(n\\,0)", "-vframes", "1", `${base}_f0.png`]);
  if (flags.frame) run("ffmpeg", ["-y", "-loglevel", "error", "-i", `${base}.mp4`, "-vf", `select=eq(n\\,${flags.frame})`, "-vframes", "1", `${base}_f${flags.frame}.png`]);
  console.log(`Done: ${base}.mp4, ${base}.gif, ${base}_f0.png`);
}
