const vulnyxDataUrl = "https://raw.githubusercontent.com/ct0l4/vulnyx.github.io/main/_data/db.yml";

export type VulNyxMachine = {
  slug: string;
  name: string;
  os: string;
  creator: string;
  difficulty: string;
  downloadUrl: string;
  size?: string;
  release?: string;
  status?: string;
};

export type VulNyxParseResult =
  | { ok: true; machines: VulNyxMachine[] }
  | { ok: false; error: string };

export type VulNyxCatalogResult =
  | { status: "ready"; machines: VulNyxMachine[] }
  | { status: "unavailable"; machines: []; reason: "network" | "http" | "invalid-data" };

type MachineDraft = { slug: string; fields: Record<string, string> };

function scalar(value: string) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
  return trimmed;
}

export function parseVulNyxMachines(yaml: string): VulNyxParseResult {
  const drafts: MachineDraft[] = [];
  let current: MachineDraft | undefined;

  for (const line of yaml.split(/\r?\n/)) {
    const record = /^([a-z0-9][a-z0-9_-]*):\s*$/i.exec(line);
    if (record) {
      current = { slug: record[1], fields: {} };
      drafts.push(current);
      continue;
    }

    const field = /^  (name|os|creator|difficulty|url|size|release|status):\s*(.*?)\s*$/.exec(line);
    if (current && field) current.fields[field[1]] = scalar(field[2]);
  }

  if (drafts.length === 0) return { ok: false, error: "No machine records found." };

  const machines: VulNyxMachine[] = [];
  for (const draft of drafts) {
    const { name, os, creator, difficulty, url, size, release, status } = draft.fields;
    if (!name || !os || !creator || !difficulty || !url) {
      return { ok: false, error: `Required machine metadata is missing for ${draft.slug}.` };
    }

    let downloadUrl: URL;
    try {
      downloadUrl = new URL(url);
    } catch {
      return { ok: false, error: `Invalid download URL for ${draft.slug}.` };
    }
    if (downloadUrl.protocol !== "https:" || downloadUrl.hostname !== "mega.nz") {
      return { ok: false, error: `Unexpected download host for ${draft.slug}.` };
    }

    machines.push({
      slug: draft.slug,
      name,
      os,
      creator,
      difficulty,
      downloadUrl: downloadUrl.toString(),
      ...(size ? { size } : {}),
      ...(release ? { release } : {}),
      ...(status ? { status } : {})
    });
  }

  return { ok: true, machines };
}

export async function getVulNyxMachineCatalog(): Promise<VulNyxCatalogResult> {
  let response: Response;
  try {
    response = await fetch(vulnyxDataUrl, { next: { revalidate: 3600 } });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Unable to fetch VulNyx machine metadata.", error);
    return { status: "unavailable", machines: [], reason: "network" };
  }

  if (!response.ok) {
    console.error(`VulNyx metadata request failed with HTTP ${response.status}.`);
    return { status: "unavailable", machines: [], reason: "http" };
  }

  const parsed = parseVulNyxMachines(await response.text());
  if (!parsed.ok) {
    console.error("VulNyx machine metadata could not be parsed.", parsed.error);
    return { status: "unavailable", machines: [], reason: "invalid-data" };
  }

  return { status: "ready", machines: parsed.machines };
}
