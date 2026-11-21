
const BASE_URL = "https://servicodados.ibge.gov.br/api/v1/paises";

export class IbgeError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface IbgeCountry {
  id: { "ISO-3166-1-ALPHA-2"?: string };
  nome: { abreviado?: string };
  area?: { total?: string | null } | null;
  localizacao?: {
    regiao?: { nome?: string } | null;
    "sub-regiao"?: { nome?: string } | null;
  } | null;
  governo?: { capital?: { nome?: string } | null } | null;
}

export interface IbgeIndicator {
  id: number;
  indicador?: string;
  unidade?: { id?: string } | null;
  series?: { serie?: Record<string, string | null>[] }[];
}

export async function ibgeFetch<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json", "User-Agent": "atlas-de-paises-uespi" },
      cache: "no-store",
    });
  } catch {
    throw new IbgeError("Falha na comunicação com a API do IBGE.", 502);
  }
  if (res.status === 400 || res.status === 404) throw new IbgeError("País não encontrado.", 404);
  if (!res.ok) throw new IbgeError("A API do IBGE retornou um erro.", 502);
  try {
    return (await res.json()) as T;
  } catch {
    throw new IbgeError("Resposta inválida da API do IBGE.", 502);
  }
}

// Remove acentos e ignora maiúsculas/minúsculas.
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Valor mais recente disponível de um indicador, com o ano.
export function latestValue(ind: IbgeIndicator): { value: number; year: number } | null {
  const entries = ind.series?.[0]?.serie ?? [];
  let best: { value: number; year: number } | null = null;
  for (const obj of entries) {
    for (const [yearText, raw] of Object.entries(obj)) {
      if (raw === null || raw === "") continue;
      const value = Number(raw);
      const year = Number(yearText);
      if (!Number.isFinite(value) || !Number.isFinite(year)) continue;
      if (!best || year > best.year) best = { value, year };
    }
  }
  return best;
}

export interface CountrySummary {
  code: string;
  name: string;
  continent: string;
}

let cache: { data: CountrySummary[]; at: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function getAllCountries(): Promise<CountrySummary[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const raw = await ibgeFetch<IbgeCountry[]>("");
  const data: CountrySummary[] = raw
    .filter((c) => c.id?.["ISO-3166-1-ALPHA-2"] && c.nome?.abreviado)
    .map((c) => ({
      code: c.id["ISO-3166-1-ALPHA-2"] as string,
      name: c.nome.abreviado as string,
      continent: c.localizacao?.regiao?.nome ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  cache = { data, at: Date.now() };
  return data;
}