import { NextRequest, NextResponse } from "next/server";
import { getAllCountries, normalizeText } from "@/lib/ibge";
import { handleError, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";
  const continent = searchParams.get("continent")?.trim() ?? "";
  if (name.length > 100 || continent.length > 50) {
    return jsonError("Parâmetro de busca inválido.", 400);
  }
  try {
    let list = await getAllCountries();
    if (name) {
      const n = normalizeText(name);
      list = list.filter((c) => normalizeText(c.name).includes(n));
    }
    if (continent) {
      const k = normalizeText(continent);
      list = list.filter((c) => normalizeText(c.continent) === k);
    }
    return NextResponse.json(list);
  } catch (e) {
    return handleError(e);
  }
}