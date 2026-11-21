import { NextResponse } from "next/server";
import { IbgeError } from "./ibge";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof IbgeError) return jsonError(e.message, e.status);
  console.error(e);
  return jsonError("Erro interno do servidor.", 500);
}