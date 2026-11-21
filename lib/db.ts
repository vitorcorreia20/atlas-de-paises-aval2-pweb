import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type TravelStatus = "want_to_visit" | "visited";

export interface TravelItem {
  id: number;
  country_code: string;
  name: string;
  status: TravelStatus;
  note: string | null;
  created_at: string;
}

export const TRAVEL_STATUSES: readonly TravelStatus[] = ["want_to_visit", "visited"];
export const NOTE_MAX_LENGTH = 500;

// Registros iniciais: definidos somente aqui. Códigos ISO alpha-2 existentes no IBGE.
const SEED_ITEMS: Omit<TravelItem, "id" | "created_at">[] = [
  { country_code: "BR", name: "Brasil", status: "visited", note: "Meu país favorito." },
  { country_code: "JP", name: "Japão", status: "want_to_visit", note: "Ver as cerejeiras na primavera." },
  { country_code: "PT", name: "Portugal", status: "want_to_visit", note: null },
  { country_code: "AR", name: "Argentina", status: "visited", note: null },
  { country_code: "IT", name: "Itália", status: "want_to_visit", note: "Roteiro por Roma e Florença." },
];

// Reaproveita a conexão entre recarregamentos do servidor de desenvolvimento.
const globalForDb = globalThis as unknown as { travelDb?: Database.Database };

function createDb(): Database.Database {
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, "app.db");
  fs.mkdirSync(dir, { recursive: true });
  const isNew = !fs.existsSync(file);

  const db = new Database(file);
  db.pragma("journal_mode = DELETE"); // modo padrão; WAL não deve ser usado

  db.exec(`
    CREATE TABLE IF NOT EXISTS travel_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('want_to_visit', 'visited')),
      note TEXT CHECK (note IS NULL OR length(note) <= 500),
      created_at TEXT NOT NULL
    )
  `);

  if (isNew) {
    const insert = db.prepare(
      `INSERT OR IGNORE INTO travel_list (country_code, name, status, note, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    const seed = db.transaction(() => {
      for (const item of SEED_ITEMS) {
        insert.run(item.country_code, item.name, item.status, item.note, new Date().toISOString());
      }
    });
    seed();
  }
  return db;
}

export function getDb(): Database.Database {
  if (!globalForDb.travelDb) globalForDb.travelDb = createDb();
  return globalForDb.travelDb;
}