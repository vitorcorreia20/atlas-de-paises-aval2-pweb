import { NextResponse } from "next/server";
import {
  ibgeFetch, latestValue, IbgeCountry, IbgeIndicator, IbgeError,
} from "@/lib/ibge";
import { handleError, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

// CONFIRME estes IDs no navegador. O nome exibido vem da própria API.
const POPULATION_ID = 77849;
const INDICATOR_IDS = [77849, 77823, 77831, 77830];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;
  if (!/^[A-Za-z]{2,3}$/.test(rawCode)) {
    return jsonError("Código de país inválido.", 400);
  }
  const code = rawCode.toUpperCase();

  try {
    const [countries, indicators] = await Promise.all([
      ibgeFetch<IbgeCountry[]>(`/${code}`),
      ibgeFetch<IbgeIndicator[]>(`/${code}/indicadores/${INDICATOR_IDS.join("|")}`),
    ]);
    const country = countries[0];
    if (!country) throw new IbgeError("País não encontrado.", 404);

    const parsed = indicators
      .map((ind) => ({ id: ind.id, name: ind.indicador ?? `Indicador ${ind.id}`, latest: latestValue(ind) }))
      .filter((i) => i.latest !== null);

    const population = parsed.find((i) => i.id === POPULATION_ID)?.latest?.value ?? null;
    const areaRaw = Number(country.area?.total);
    const areaKm2 = Number.isFinite(areaRaw) && areaRaw > 0 ? areaRaw : null;
    const demographicDensity =
      population !== null && areaKm2 !== null
        ? Math.round((population / areaKm2) * 100) / 100
        : null;

    return NextResponse.json({
      code,
      name: country.nome.abreviado ?? code,
      continent: country.localizacao?.regiao?.nome ?? "",
      subRegion: country.localizacao?.["sub-regiao"]?.nome ?? "",
      capital: country.governo?.capital?.nome ?? "",
      areaKm2,
      population,
      demographicDensity,
      indicators: parsed.map((i) => ({
        name: i.name,
        value: i.latest!.value,
        year: i.latest!.year,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}

