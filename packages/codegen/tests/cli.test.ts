import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8"),
);

describe("CLI", () => {
  it("outputs the correct version", () => {
    const result = execSync("node dist/index.js --version", {
      encoding: "utf8",
      cwd: join(__dirname, ".."),
    });

    expect(result.trim()).toBe(packageJson.version);
  });

  it("shows help when --help is passed", () => {
    const result = execSync("node dist/index.js --help", {
      encoding: "utf8",
      cwd: join(__dirname, ".."),
    });

    expect(result).toContain("Generate Cube Record type definitions");
    expect(result).toContain("Usage:");
    expect(result).toContain("Options:");
  });

  it("exits with error when required output option is missing", () => {
    expect(() => {
      execSync("node dist/index.js", {
        encoding: "utf8",
        cwd: join(__dirname, ".."),
        stdio: "pipe",
      });
    }).toThrow();
  });
});
