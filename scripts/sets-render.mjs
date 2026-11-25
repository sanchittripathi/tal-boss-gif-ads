#!/usr/bin/env node
// Render every role set in a sets.json:  node scripts/sets-render.mjs <sets.json> <outDir> [--only=name,name] [--jobs=3] [--audience=boss]
// Per set: <outDir>/gifs/<name>.gif (+ mp4s/<name>.mp4), statics-3-roles/<name>.png, statics-1-role/<name>__<company>.png
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [file, out] = args.filter((a) => !a.startsWith("--"));
let sets = JSON.parse(readFileSync(file, "utf8"));
if (flags.only) sets = sets.filter((s) => flags.only.split(",").includes(s.name));
for (const d of ["gifs", "mp4s", "statics-3-roles", "statics-1-role", ".props"]) mkdirSync(join(out, d), { recursive: true });
const run = (cmd, argv) => new Promise((res, rej) => { const c = spawn(cmd, argv, { stdio: ["ignore", "ignore", "inherit"] }); c.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${argv.slice(0, 5).join(" ")} -> ${code}`)))); });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const props = (s, roles, tag) => { const f = join(out, ".props", `${s.name}_${tag}.json`); writeFileSync(f, JSON.stringify({ fn: s.fn, total: s.total, audience: flags.audience ?? "candidate", roles: roles.map(({ company, title, location, exp, logo, rank }) => ({ company, title, location, ...(exp ? { exp } : {}), logo, rank })) })); return `--props=${f}`; };
const tasks = [];
for (const s of sets) {
  tasks.push(async () => { const png = join(out, "statics-1-role", `${s.name}__${slug(s.roles[0].company)}.png`); if (!existsSync(png) || flags.force) await run("npx", ["remotion", "still", "src/index.ts", "J-set-S1", png, props(s, s.roles.slice(0, 1), "s1"), "--log=error"]); });
  tasks.push(async () => { const png = join(out, "statics-3-roles", `${s.name}.png`); if (!existsSync(png) || flags.force) await run("npx", ["remotion", "still", "src/index.ts", "J-set-S3", png, props(s, s.roles.slice(0, 3), "s3"), "--log=error"]); });
  if (s.roles.length >= 4) tasks.push(async () => {
    const mp4 = join(out, "mp4s", `${s.name}.mp4`), gif = join(out, "gifs", `${s.name}.gif`);
    if (existsSync(gif) && !flags.force) return;
    await run("npx", ["remotion", "render", "src/index.ts", "J-set-G", mp4, props(s, s.roles, "g"), "--crf=16", "--log=error", "--concurrency=3"]);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", "fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=200[p];[b][p]paletteuse=dither=bayer:bayer_scale=4", gif]);
  });
}
let done = 0, failed = [];
const worker = async () => { while (tasks.length) { const t = tasks.shift(); try { await t(); } catch (e) { failed.push(e.message); } done++; if (done % 10 === 0) console.log(`${done} done, ${tasks.length} left`); } };
await Promise.all(Array.from({ length: Number(flags.jobs ?? 3) }, worker));
console.log(`Finished. ${done} renders, ${failed.length} failed.`); failed.forEach((f) => console.log("FAILED", f));
