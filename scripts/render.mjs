#!/usr/bin/env node
// Render a variant to out/<name>.mp4 and out/<name>.gif (720 wide).
//
//   npm run render -- variants/reply-design-lead.json            (the ad is picked from the file name)
//   npm run render -- R7-Reply variants/reply-design-lead.json   (or name it)
//   npm run render -- variants/reply.json --gif1080              (also out/<name>-1080.gif)
//   npm run render -- variants/reply.json --no-gif               (MP4 only)
//   npm run render:all                                           (every file in variants/)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const ADS = [
  ["silk-board", "R7-SilkBoard"],
  ["tal-does", "R7-TalDoes"],
  ["reply", "R7-Reply"],
];

// licensed fonts, not in the repo (see README > Fonts). Renders still work without them, in Inter / the system font.
const FONTS = [
  "ObviouslyNarrowBlackItalic.otf", "ObviouslyNarrowBold.otf",
  "SF-Pro-Display-Regular.otf", "SF-Pro-Display-Medium.otf", "SF-Pro-Display-Semibold.otf",
  "SF-Pro-Text-Regular.otf", "SF-Pro-Text-Medium.otf", "SF-Pro-Text-Semibold.otf",
];
const missingFonts = FONTS.filter((f) => !existsSync(join("public", "fonts", f)));
if (missingFonts.length) console.warn(`\nWARNING: missing fonts in public/fonts/: ${missingFonts.join(", ")}.\nThe render will fall back to Inter / the system font and will not match the approved ads. See README > Fonts.\n`);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const rest = args.filter((a) => !a.startsWith("--"));

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};
const run = (cmd, argv) => {
  console.log(`\n$ ${cmd} ${argv.join(" ")}`);
  const r = spawnSync(cmd, argv, { stdio: "inherit" });
  if (r.status !== 0) die(`${cmd} failed (exit ${r.status})`);
};
const adFor = (file) => {
  const name = basename(file, ".json");
  const hit = ADS.find(([prefix]) => name === prefix || name.startsWith(prefix + "-"));
  if (!hit) die(`Can't tell which ad ${file} is for. Name it reply-*.json, tal-does-*.json or silk-board-*.json, or pass the ad id first (R7-Reply, R7-TalDoes, R7-SilkBoard).`);
  return hit[1];
};
const gif = (mp4, out, width) =>
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", `fps=15,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, out]);

const render = (comp, file) => {
  if (!existsSync(file)) die(`No such file: ${file}`);
  const name = basename(file, ".json");
  mkdirSync("out", { recursive: true });
  const mp4 = join("out", `${name}.mp4`);
  run("npx", ["remotion", "render", "src/index.ts", comp, mp4, `--props=${file}`, "--crf=16"]);
  if (!flags.has("--no-gif")) {
    gif(mp4, join("out", `${name}.gif`), 720);
    if (flags.has("--gif1080")) gif(mp4, join("out", `${name}-1080.gif`), 1080);
  }
  console.log(`\nDone: ${mp4}${flags.has("--no-gif") ? "" : `, out/${name}.gif`}`);
};

if (flags.has("--all")) {
  for (const f of readdirSync("variants").filter((f) => f.endsWith(".json")).sort()) render(adFor(f), join("variants", f));
} else if (rest.length === 1) {
  render(adFor(rest[0]), rest[0]);
} else if (rest.length === 2) {
  render(rest[0], rest[1]);
} else {
  die("Usage: npm run render -- [R7-Reply|R7-TalDoes|R7-SilkBoard] variants/<name>.json [--gif1080] [--no-gif]\n       npm run render:all");
}
