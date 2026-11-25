#!/usr/bin/env node
// Render role sets in the final look (src/jobs/final):
//   node scripts/final-render.mjs <sets.json> <outDir> [--only=name,name] [--jobs=2] [--roles=4] [--audience=boss] [--width=1080] [--force]
// Per set: <outDir>/gifs/<name>.gif (25 fps), mp4s/<name>.mp4 (50 fps), statics/<name>__<company>.png (first role).
// A set needs at least 3 roles for a GIF. --roles caps how many roles one GIF shows (default 4).
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? "1"]; }));
const [file, out] = args.filter((a) => !a.startsWith("--"));
if (!file || !out) { console.error("usage: node scripts/final-render.mjs <sets.json> <outDir>"); process.exit(1); }
let sets = JSON.parse(readFileSync(file, "utf8"));
if (flags.only) sets = sets.filter((s) => flags.only.split(",").includes(s.name));
for (const d of ["gifs", "mp4s", "statics", ".props"]) mkdirSync(join(out, d), { recursive: true });
const run = (cmd, argv) => new Promise((res, rej) => { const c = spawn(cmd, argv, { stdio: ["ignore", "ignore", "inherit"] }); c.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${argv.slice(0, 5).join(" ")} -> ${code}`)))); });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const props = (s, roles, tag) => { const f = join(out, ".props", `${s.name}_${tag}.json`); writeFileSync(f, JSON.stringify({ fn: s.fn, total: s.total, audience: flags.audience ?? "candidate", roles: roles.map(({ company, title, location, exp, logo, rank }) => ({ company, title, location, ...(exp ? { exp } : {}), logo, rank })) })); return `--props=${f}`; };
const width = Number(flags.width ?? 1080), cap = Number(flags.roles ?? 4);
const tasks = [];
for (const s of sets) {
  tasks.push(async () => { const png = join(out, "statics", `${s.name}__${slug(s.roles[0].company)}.png`); if (!existsSync(png) || flags.force) await run("npx", ["remotion", "still", "src/index.ts", "J-final-S1", png, props(s, s.roles.slice(0, 1), "s1"), "--log=error"]); });
  if (s.roles.length >= 3) tasks.push(async () => {
    const mp4 = join(out, "mp4s", `${s.name}.mp4`), gif = join(out, "gifs", `${s.name}.gif`);
    if (existsSync(gif) && !flags.force) return;
    await run("npx", ["remotion", "render", "src/index.ts", "J-final-G", mp4, props(s, s.roles.slice(0, cap), "g"), "--crf=12", "--log=error", "--concurrency=4"]);
    // 50 fps -> 25 fps is an exact frame drop and an exact 4 cs GIF delay. Full 256-colour palette, error-diffusion dither for the gradient.
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", `fps=25,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`, gif]);
  });
}
let done = 0; const failed = [];
const worker = async () => { while (tasks.length) { const t = tasks.shift(); try { await t(); } catch (e) { failed.push(e.message); } done++; if (done % 10 === 0) console.log(`${done} done, ${tasks.length} left`); } };
await Promise.all(Array.from({ length: Number(flags.jobs ?? 2) }, worker));
console.log(`Finished. ${done} renders, ${failed.length} failed.`); failed.forEach((f) => console.log("FAILED", f));
