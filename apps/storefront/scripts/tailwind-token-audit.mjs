import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = new URL("..", import.meta.url).pathname;
const sourceDir = path.join(rootDir, "src");

const allowedRawColorFiles = new Set([
  "src/app/apple-icon.tsx",
  "src/app/icon.svg",
  "src/app/globals.css",
  "src/app/layout.tsx",
  "src/app/manifest.ts",
]);

const checkedExtensions = new Set([".css", ".ts", ".tsx"]);
const rawColorPattern = /#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(/g;
const arbitraryColorClassPattern =
  /\b(?:bg|text|border|ring|outline|from|via|to|shadow)-\[(?:#|rgb|hsl|oklch)/g;
const arbitraryTextSizeClassPattern = /\b(?:\w+:)*text-\[[^\]]+\]/g;
const gradientClassPattern = /\bbg-gradient[^\s"`']*/g;

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listFiles(entryPath);
      }

      if (checkedExtensions.has(path.extname(entry.name))) {
        return entryPath;
      }

      return [];
    }),
  );

  return files.flat();
}

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

const violations = [];

for (const file of await listFiles(sourceDir)) {
  const relativePath = path.relative(rootDir, file);
  const source = await readFile(file, "utf8");
  const allowRawColors = allowedRawColorFiles.has(relativePath);

  if (!allowRawColors) {
    for (const match of source.matchAll(rawColorPattern)) {
      violations.push({
        file: relativePath,
        line: getLineNumber(source, match.index ?? 0),
        message: `raw color "${match[0]}" should use a Tailwind token`,
      });
    }
  }

  for (const match of source.matchAll(arbitraryColorClassPattern)) {
    violations.push({
      file: relativePath,
      line: getLineNumber(source, match.index ?? 0),
      message: `arbitrary color utility "${match[0]}" should use a token`,
    });
  }

  for (const match of source.matchAll(arbitraryTextSizeClassPattern)) {
    violations.push({
      file: relativePath,
      line: getLineNumber(source, match.index ?? 0),
      message: `arbitrary text-size utility "${match[0]}" should use a text token`,
    });
  }

  for (const match of source.matchAll(gradientClassPattern)) {
    violations.push({
      file: relativePath,
      line: getLineNumber(source, match.index ?? 0),
      message: `gradient utility "${match[0]}" is outside the storefront design rules`,
    });
  }
}

if (violations.length > 0) {
  console.error("Tailwind token audit failed:");

  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line} - ${violation.message}`);
  }

  process.exit(1);
}

console.log("Tailwind token audit passed.");
