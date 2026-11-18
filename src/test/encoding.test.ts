import { Buffer } from "node:buffer";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { cwd } from "node:process";
import { describe, expect, it } from "vitest";

/**
 * A guard against text that has been through a cp1252 round-trip.
 *
 * This has bitten this repository twice. A tool read a UTF-8 file as if it were
 * Windows-1252, wrote it back out as UTF-8, and every non-ASCII character came
 * out as the mojibake spelling of its own bytes: `ქართული` became `áƒ¥áƒáƒ áƒ—áƒ£áƒšáƒ˜`
 * and every `—` became `â€”`. The Georgian one shipped to production and sat on
 * the "create a website" form for a day before anyone noticed, because the
 * damage is invisible to the type checker, invisible to the tests, and looks
 * like a runtime encoding bug rather than what it is: wrong bytes on disk.
 *
 * Georgian is the default language here, so most user-facing text in this
 * codebase is at risk, and nobody proof-reads a diff for it. That makes it a
 * test's job rather than a reviewer's.
 */

// cp1252 is Latin-1 except for 0x80-0x9f, which is where the interesting
// characters live: `€`, the curly quotes, and the en and em dashes. Those are
// exactly the bytes a UTF-8 lead byte turns into, so getting this range right
// is the whole game.
const CP1252_HIGH =
  "\u20ac\u0081\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030" +
  "\u0160\u2039\u0152\u008d\u017d\u008f\u0090\u2018\u2019\u201c" +
  "\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u009d" +
  "\u017e\u0178";

const TO_BYTE = new Map<string, number>();
for (let byte = 0; byte < 256; byte += 1) {
  const char =
    byte >= 0x80 && byte <= 0x9f
      ? CP1252_HIGH[byte - 0x80]
      : String.fromCharCode(byte);
  TO_BYTE.set(char, byte);
}

/**
 * What `text` was before someone decoded it as cp1252, or `undefined` if it was
 * never mangled.
 *
 * The test is deliberately a round-trip rather than a list of suspicious
 * substrings. A marker list only catches the corruptions someone thought to
 * write down — the first version of this check searched for `â€` and silently
 * missed all nine damaged comments in `auth.tsx`, because cp1252 maps 0x80 to
 * `€` and not to U+0080. Re-encoding and asking the UTF-8 decoder is the
 * question we actually mean, and it has no such blind spot.
 */
function recoverMojibake(text: string): string | undefined {
  const bytes: number[] = [];
  for (const char of text) {
    const byte = TO_BYTE.get(char);
    // Not representable in cp1252, so it cannot be the output of decoding
    // bytes as cp1252. Real Georgian lands here, which is why this is cheap.
    if (byte === undefined) return undefined;
    bytes.push(byte);
  }
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      new Uint8Array(bytes),
    );
  } catch {
    // Not valid UTF-8, so these bytes were never a UTF-8 string. Ordinary
    // Latin-1 text such as `café` stops here.
    return undefined;
  }
  return decoded === text ? undefined : decoded;
}

const SKIP = new Set([
  "node_modules",
  ".git",
  "dist",
  "coverage",
  ".vercel",
]);

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      sourceFiles(path, found);
      continue;
    }
    found.push(path);
  }
  return found;
}

/** Binary files have nothing to say about text encoding. */
function isText(bytes: Buffer): boolean {
  return !bytes.includes(0);
}

// `cwd`, `Buffer` and the `node:` modules are imported by name rather than
// taken from the ambient globals on purpose. `tsconfig.json` asks for
// `vite/client` types only, and adding `node` to that list would hand every
// component in this browser app a `process` that type-checks and then is not
// there at runtime. An explicit import keeps Node inside this one file.
//
// `import.meta.url` is not a file URL under vitest, so it is not an option here.
const ROOT = cwd();

describe("source encoding", () => {
  const files = sourceFiles(ROOT);

  it("scans a plausible number of files", () => {
    // Cheap insurance against the walk silently matching nothing and this whole
    // file passing while checking air.
    expect(files.length).toBeGreaterThan(50);
  });

  it("has no text that was decoded as cp1252 and re-saved", () => {
    const damaged: string[] = [];
    for (const file of files) {
      const bytes = readFileSync(file);
      if (!isText(bytes)) continue;
      bytes
        .toString("utf8")
        .split(/\r?\n/)
        .forEach((line: string, index: number) => {
          const recovered = recoverMojibake(line);
          if (recovered === undefined) return;
          damaged.push(
            `${relative(ROOT, file).split(sep).join("/")}:${index + 1}` +
              `\n    is: ${line.trim()}` +
              `\n  want: ${recovered.trim()}`,
          );
        });
    }
    expect(damaged, `mojibake on disk:\n${damaged.join("\n")}`).toEqual([]);
  });

  it("has no UTF-8 byte order marks", () => {
    // The same tool that mangled those two files also wrote a BOM into them,
    // and nothing else in the repository has one. It is worth failing on,
    // because it is the fingerprint of the editor that does the damage.
    const withBom = files.filter((file) => {
      const bytes = readFileSync(file);
      return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    });
    expect(withBom.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it("is every file valid UTF-8 in the first place", () => {
    const invalid = files.filter((file) => {
      const bytes = readFileSync(file);
      if (!isText(bytes)) return false;
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return false;
      } catch {
        return true;
      }
    });
    expect(invalid.map((f) => relative(ROOT, f))).toEqual([]);
  });
});

describe("recoverMojibake", () => {
  // Written as escapes rather than as the mangled characters themselves, so
  // this file does not trip the scan above.
  const MANGLED_KA =
    "\u00e1\u0192\u00a5\u00e1\u0192\u0090\u00e1\u0192\u00a0\u00e1\u0192" +
    "\u2014\u00e1\u0192\u00a3\u00e1\u0192\u0161\u00e1\u0192\u02dc";

  it("recovers the string that actually shipped broken", () => {
    // The negative control. A guard that cannot be shown to fail is not a
    // guard, so this is the real production defect, fed in deliberately.
    expect(recoverMojibake(MANGLED_KA)).toBe("ქართული");
  });

  it("recovers a mangled em dash", () => {
    expect(recoverMojibake("a \u00e2\u20ac\u201d b")).toBe("a — b");
  });

  it("flags a whole mangled line, not just the character", () => {
    expect(
      recoverMojibake(`<option value="ka">${MANGLED_KA}</option>`),
    ).toBe('<option value="ka">ქართული</option>');
  });

  it("leaves correct text alone", () => {
    // The cases that would make this test a nuisance if it were wrong: real
    // Georgian, a real em dash, and Latin-1 text that is not UTF-8 underneath.
    expect(recoverMojibake("ქართული")).toBeUndefined();
    expect(recoverMojibake("a — b")).toBeUndefined();
    expect(recoverMojibake("café")).toBeUndefined();
    expect(recoverMojibake("plain ascii")).toBeUndefined();
    expect(recoverMojibake("")).toBeUndefined();
  });
});
