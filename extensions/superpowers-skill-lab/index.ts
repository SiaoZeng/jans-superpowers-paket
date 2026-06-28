import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runSkillLab } from "./src/runStore.ts";
import { type MutatorName } from "./src/mutators.ts";
import { loadRegistry, validateRegistryRecords } from "./src/registry.ts";
import { EXTENSION_ROOT, isInsidePath, RUNS_ROOT } from "./src/paths.ts";

interface ParsedArgs {
  target?: string;
  dataset?: string;
  mutator?: MutatorName;
  run?: string;
}

const DEFAULT_TARGET = join(EXTENSION_ROOT, "fixtures", "valid-skill", "SKILL.md");
const DEFAULT_DATASET = join(EXTENSION_ROOT, "fixtures", "evals", "basic.jsonl");
const DEFAULT_MUTATOR: MutatorName = "fixture-passing";

function parseArgs(args: string): ParsedArgs {
  const result: ParsedArgs = {};
  const tokens = args.trim().length === 0 ? [] : args.trim().split(/\s+/);
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const value = tokens[index + 1];
    if (token === "--target") {
      result.target = value;
      index += 1;
    } else if (token === "--dataset") {
      result.dataset = value;
      index += 1;
    } else if (token === "--mutator") {
      if (!["noop", "fixture-passing", "fixture-failing"].includes(value)) throw new Error(`Unsupported mutator: ${value}`);
      result.mutator = value as MutatorName;
      index += 1;
    } else if (token === "--run") {
      result.run = value;
      index += 1;
    } else if (token.length > 0) {
      throw new Error(`Unsupported argument: ${token}`);
    }
  }
  return result;
}

function notify(ctx: any, message: string, level: "info" | "warn" | "error" = "info") {
  if (ctx?.ui?.notify) ctx.ui.notify(message, level);
  else console.log(message);
}

function resolveRunDir(runArg: string): string {
  const candidate = runArg.startsWith("/") ? resolve(runArg) : join(RUNS_ROOT, runArg);
  if (!isInsidePath(candidate, RUNS_ROOT)) throw new Error(`Run path is outside Skill Lab run root: ${candidate}`);
  return candidate;
}

export default function superpowersSkillLabExtension(pi: ExtensionAPI) {
  pi.registerCommand("skill-lab-run", {
    description: "Run the offline Skill Lab against a target and dataset",
    handler: async (args, ctx) => {
      try {
        const parsed = parseArgs(args);
        const result = await runSkillLab({
          targetPath: parsed.target || DEFAULT_TARGET,
          datasetPath: parsed.dataset || DEFAULT_DATASET,
          mutator: parsed.mutator || DEFAULT_MUTATOR,
        });
        notify(ctx, `Skill Lab run ${result.run.run_id}: ${result.candidate.status}\n${result.run.run_dir}`, "info");
      } catch (error) {
        notify(ctx, `skill-lab-run failed: ${(error as Error).message}`, "error");
      }
    },
  });

  pi.registerCommand("skill-lab-inspect", {
    description: "Inspect an existing Skill Lab run without mutating files",
    handler: async (args, ctx) => {
      try {
        const parsed = parseArgs(args);
        if (!parsed.run) throw new Error("Usage: /skill-lab-inspect --run <run-id-or-run-dir>");
        const runDir = resolveRunDir(parsed.run);
        const scorecardPath = join(runDir, "scorecard.md");
        if (!existsSync(scorecardPath)) throw new Error(`scorecard.md not found: ${scorecardPath}`);
        notify(ctx, readFileSync(scorecardPath, "utf8"), "info");
      } catch (error) {
        notify(ctx, `skill-lab-inspect failed: ${(error as Error).message}`, "error");
      }
    },
  });

  pi.registerCommand("skill-lab-list", {
    description: "List Skill Lab run directories",
    handler: async (_args, ctx) => {
      try {
        if (!existsSync(RUNS_ROOT)) {
          notify(ctx, "No Skill Lab run root exists yet.", "info");
          return;
        }
        const runs = readdirSync(RUNS_ROOT, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort();
        notify(ctx, runs.length === 0 ? "No Skill Lab runs found." : runs.join("\n"), "info");
      } catch (error) {
        notify(ctx, `skill-lab-list failed: ${(error as Error).message}`, "error");
      }
    },
  });

  pi.registerCommand("skill-lab-validate-registry", {
    description: "Validate Skill Lab external-pattern registry records",
    handler: async (_args, ctx) => {
      try {
        const summary = validateRegistryRecords(loadRegistry());
        const message = summary.valid
          ? `Registry valid: ${summary.valid_count} records, ${summary.invalid_count} invalid.`
          : `Registry invalid: ${summary.valid_count} records valid, ${summary.invalid_count} invalid.\n${summary.errors.join("\n")}`;
        notify(ctx, message, summary.valid ? "info" : "error");
      } catch (error) {
        notify(ctx, `skill-lab-validate-registry failed: ${(error as Error).message}`, "error");
      }
    },
  });
}
