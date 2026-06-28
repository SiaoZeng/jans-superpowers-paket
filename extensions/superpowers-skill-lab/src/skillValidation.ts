import type { ValidationResult } from "./model.ts";
import { invalid } from "./model.ts";

export interface ParsedSkillFile {
  frontmatter: Record<string, string>;
  name: string;
  description: string;
  body: string;
}

const MAX_SKILL_BYTES = 64 * 1024;
const FORBIDDEN_TEMPLATE_MARKERS = [/\{\{[^}]+\}\}/, /<TODO>/i, /TODO:/i];
const FORBIDDEN_HIERARCHY_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(system|developer|user)?\s*instructions?/i,
  /override\s+(system|developer|user)\s+instructions?/i,
  /disregard\s+(system|developer|user|previous|prior)/i,
];
const FORBIDDEN_DESTRUCTIVE_PATTERNS = [/\brm\s+-rf\s+\//i, /\bmkfs\b/i, /\bdd\s+if=.*\sof=/i, /\bchmod\s+-R\s+777\b/i];
const SECRET_PATH_PATTERNS = [/\.ssh\//i, /\.gnupg\//i, /\.env(\.|\b)/i, /credential/i, /token/i, /secret/i];

export function parseSkillFile(text: string): ParsedSkillFile {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("SKILL.md must start with YAML frontmatter delimited by ---");
  const frontmatter: Record<string, string> = {};
  for (const [index, rawLine] of match[1].split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (line === "") continue;
    const colon = line.indexOf(":");
    if (colon <= 0) throw new Error(`Invalid frontmatter line ${index + 1}: ${rawLine}`);
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, "");
    if (frontmatter[key] !== undefined) throw new Error(`Duplicate frontmatter key: ${key}`);
    frontmatter[key] = value;
  }
  return {
    frontmatter,
    name: frontmatter.name || "",
    description: frontmatter.description || "",
    body: match[2] || "",
  };
}

export interface SkillValidationOptions {
  baselineBytes?: number;
  maxGrowthRatio?: number;
}

export function validateSkillText(text: string, options: SkillValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  let parsed: ParsedSkillFile | undefined;
  try {
    parsed = parseSkillFile(text);
  } catch (error) {
    errors.push((error as Error).message);
  }

  if (Buffer.byteLength(text, "utf8") > MAX_SKILL_BYTES) errors.push(`SKILL.md exceeds ${MAX_SKILL_BYTES} byte size limit`);
  if (options.baselineBytes !== undefined) {
    const ratio = Buffer.byteLength(text, "utf8") / Math.max(options.baselineBytes, 1);
    if (ratio > (options.maxGrowthRatio ?? 1.5)) errors.push("candidate exceeds allowed growth limit");
  }

  if (parsed) {
    if (!parsed.name.trim()) errors.push("frontmatter.name is required");
    if (!parsed.description.trim()) errors.push("frontmatter.description is required");
    if (!parsed.body.trim()) errors.push("skill body is required");
    if (!/^[-a-z0-9]+$/i.test(parsed.name)) errors.push("frontmatter.name must be slug-like");
    if (!/##\s+(Procedure|Workflow|Process|Methodology)/i.test(parsed.body)) errors.push("skill body must include a methodology structure section");
  }

  for (const pattern of FORBIDDEN_TEMPLATE_MARKERS) if (pattern.test(text)) errors.push(`unresolved template marker rejected: ${pattern}`);
  for (const pattern of FORBIDDEN_HIERARCHY_PATTERNS) if (pattern.test(text)) errors.push("hierarchy override language rejected");
  for (const pattern of FORBIDDEN_DESTRUCTIVE_PATTERNS) if (pattern.test(text)) errors.push("destructive shell instruction rejected");
  for (const pattern of SECRET_PATH_PATTERNS) if (pattern.test(text)) errors.push("secret or credential path reference rejected");

  return invalid([...new Set(errors)]);
}
