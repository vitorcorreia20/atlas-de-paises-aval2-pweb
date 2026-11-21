import { NextRequest, NextResponse } from "next/server";
import { getDb, TravelItem, TRAVEL_STATUSES, TravelStatus, NOTE_MAX_LENGTH } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("Identificador inválido.", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corpo da requisição inválido (JSON esperado).", 400);
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const sets: string[] = [];
  const values: (string | null)[] = [];

  if ("status" in b) {
    if (typeof b.status !== "string" || !TRAVEL_STATUSES.includes(b.status as TravelStatus)) {
      return jsonError("Status inválido.", 400);
    }
    sets.push("status = ?");
    values.push(b.status);
  }
  if ("note" in b) {
    if (b.note !== null && typeof b.note !== "string") return jsonError("Observação inválida.", 400);
    const note = typeof b.note === "string" && b.note.trim() !== "" ? b.note.trim() : null;
    if (note !== null && note.length > NOTE_MAX_LENGTH) {
      return jsonError("A observação deve ter no máximo 500 caracteres.", 400);
    }
    sets.push("note = ?");
    values.push(note);
  }
  if (sets.length === 0) return jsonError("Informe status e/ou note para atualizar.", 400);

  try {
    const db = getDb();
    const result = db.prepare(`UPDATE travel_list SET ${sets.join(", ")} WHERE id = ?`).run(...values, id);
    if (result.changes === 0) return jsonError("Registro não encontrado.", 404);
    const updated = db.prepare("SELECT * FROM travel_list WHERE id = ?").get(id) as TravelItem;
    return NextResponse.json(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("Identificador inválido.", 400);
  try {
    const result = getDb().prepare("DELETE FROM travel_list WHERE id = ?").run(id);
    if (result.changes === 0) return jsonError("Registro não encontrado.", 404);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}