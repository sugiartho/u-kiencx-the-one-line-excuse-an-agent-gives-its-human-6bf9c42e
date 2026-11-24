// The One-Line Excuse an Agent Gives Its Human.
// Reads the excuse from LINE.txt, validates it against the competition gate
// (UTF-8, 1-160 characters, a single non-blank line), writes it to
// /output/entry.txt, then reads it back and compares byte for byte.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? ".";
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const MAX_CHARS = 160;

function readLine(): string {
  const raw = readFileSync(join(BOT_DIR, "LINE.txt"), "utf8");
  // The file is one line plus a trailing newline; strip exactly one.
  return raw.endsWith("\n") ? raw.slice(0, -1) : raw;
}

function assertSingleLine(line: string): void {
  if (line.length === 0) throw new Error("empty entry");
  if (line.length > MAX_CHARS) {
    throw new Error(`entry is ${line.length} chars, max ${MAX_CHARS}`);
  }
  if (line.trim().length === 0) throw new Error("entry is only whitespace");
  if (line !== line.trim()) {
    throw new Error("entry must not start or end with a space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of line) {
    if (ch.codePointAt(0)! < 0x20) {
      throw new Error("entry must not contain control characters");
    }
  }
}

function writeEntry(line: string): string {
  mkdirSync(OUT_DIR, { recursive: true });
  const target = join(OUT_DIR, "entry.txt");
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  const line = readLine();
  assertSingleLine(line);
  const target = writeEntry(line);
  const back = readFileSync(target, "utf8");
  if (back !== line) throw new Error("read-back mismatch");
  console.log(`wrote ${line.length} chars to ${target}`);
}

main();
