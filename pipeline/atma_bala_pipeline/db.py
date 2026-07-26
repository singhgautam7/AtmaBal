"""SQLite connection + a tiny forward-only migration runner. Raw SQL, no ORM —
the schema is small and we want it hand-readable/diffable in DB Browser."""

from __future__ import annotations

import sqlite3
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = PIPELINE_DIR / "atmabal.db"
MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


def connect(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _ensure_migrations_table(conn: sqlite3.Connection) -> None:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        " version TEXT PRIMARY KEY,"
        " applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))"
    )


def migrate(conn: sqlite3.Connection) -> list[str]:
    """Apply any migration files not yet recorded. Returns applied versions."""
    _ensure_migrations_table(conn)
    applied = {r["version"] for r in conn.execute("SELECT version FROM schema_migrations")}
    ran: list[str] = []
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = path.stem
        if version in applied:
            continue
        conn.executescript(path.read_text())
        conn.execute("INSERT INTO schema_migrations(version) VALUES (?)", (version,))
        conn.commit()
        ran.append(version)
    return ran


def upsert_source(conn: sqlite3.Connection, *, kind: str, title: str, retrieved_on: str,
                  url: str | None = None, publisher: str | None = None,
                  notes: str | None = None) -> int:
    cur = conn.execute(
        "INSERT INTO source(kind,title,url,publisher,retrieved_on,notes) VALUES (?,?,?,?,?,?)",
        (kind, title, url, publisher, retrieved_on, notes),
    )
    conn.commit()
    return int(cur.lastrowid)
