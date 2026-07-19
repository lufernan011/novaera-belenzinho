/**
 * Regras de agrupamento das pessoas — usadas pelo site público E pelo
 * admin (pré-visualização), para que os dois nunca divirjam.
 * Funções puras: seguras em server e client components.
 */

export const BOARD_GROUPS = [
  { key: "secretaria", label: "Secretaria" },
  { key: "tesouraria", label: "Tesouraria" },
  { key: "biblioteca", label: "Biblioteca" },
  { key: "conselho", label: "Conselho Fiscal" },
  { key: "outros", label: "Diretoria" },
] as const;

export type BoardGroupKey = (typeof BOARD_GROUPS)[number]["key"];

/** Em qual grupo da página Diretoria a pessoa aparece, pelo cargo. */
export function boardGroup(role: string): BoardGroupKey {
  const r = role.toLowerCase();
  if (r.includes("secret")) return "secretaria";
  if (r.includes("tesour")) return "tesouraria";
  if (r.includes("bibliot")) return "biblioteca";
  if (r.includes("conselho") || r.includes("fiscal")) return "conselho";
  return "outros";
}

/** "Palestras, Passes e Cursos" → ["Palestras", "Passes", "Cursos"]. */
export function workerTags(role: string): string[] {
  return role
    .split(/,|\se\s/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

const AVATAR_COLORS = [
  { bg: "#E88A4A", fg: "#4A1B0C" },
  { bg: "#F2B04E", fg: "#412402" },
  { bg: "#C05A50", fg: "#FAECE7" },
  { bg: "#6B4A6E", fg: "#FBEAF0" },
  { bg: "#2E3A63", fg: "#D7DCEC" },
  { bg: "#1D9E75", fg: "#E1F5EE" },
];

/** Cor determinística (pelo nome) para avatar de quem não tem foto. */
export function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** "Ademir Sartori" → "AS". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}
