import { NextRequest, NextResponse } from "next/server";
import { getDb, TravelItem, TRAVEL_STATUSES, TravelStatus, NOTE_MAX_LENGTH } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM travel_list ORDER BY created_at DESC, id DESC")
      .all() as TravelItem[];
    return NextResponse.json(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corpo da requisição inválido (JSON esperado).", 400);
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const countryCode = typeof b.country_code === "string" ? b.country_code.trim().toUpperCase() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const status = (b.status ?? "want_to_visit") as TravelStatus;
  const note = typeof b.note === "string" && b.note.trim() !== "" ? b.note.trim() : null;

  if (!/^[A-Z]{2,3}$/.test(countryCode)) return jsonError("Código do país inválido.", 400);
  if (!name || name.length > 100) return jsonError("Nome do país inválido.", 400);
  if (!TRAVEL_STATUSES.includes(status)) return jsonError("Status inválido.", 400);
  if (b.note !== undefined && b.note !== null && typeof b.note !== "string") {
    return jsonError("Observação inválida.", 400);
  }
  if (note !== null && note.length > NOTE_MAX_LENGTH) {
    return jsonError("A observação deve ter no máximo 500 caracteres.", 400);
  }

  try {
    const db = getDb();
    const existing = db.prepare("SELECT id FROM travel_list WHERE country_code = ?").get(countryCode);
    if (existing) return jsonError("Este país já está na sua lista.", 409);

    const result = db
      .prepare("INSERT INTO travel_list (country_code, name, status, note, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(countryCode, name, status, note, new Date().toISOString());
    const created = db
      .prepare("SELECT * FROM travel_list WHERE id = ?")
      .get(result.lastInsertRowid) as TravelItem;
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}