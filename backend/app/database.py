import sqlite3
from contextlib import contextmanager
from pathlib import Path


SCHEMA = """
CREATE TABLE IF NOT EXISTS mandates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    total_budget TEXT NOT NULL,
    remaining_budget TEXT NOT NULL,
    currency TEXT NOT NULL,
    allowed_merchants TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    human_approval_threshold TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    blockchain_network TEXT,
    tx_hash TEXT
);
CREATE TABLE IF NOT EXISTS decisions (
    decision_id TEXT PRIMARY KEY,
    mandate_id TEXT NOT NULL REFERENCES mandates(id),
    original_request TEXT NOT NULL,
    structured_request TEXT NOT NULL,
    decision TEXT NOT NULL,
    matched_rule TEXT NOT NULL,
    reason_code TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    blockchain_network TEXT,
    tx_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_decisions_mandate ON decisions(mandate_id);
CREATE TABLE IF NOT EXISTS kiln_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT,
    model TEXT NOT NULL,
    stage TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    decision_id TEXT
);
"""


class Database:
    def __init__(self, path: str):
        self.path = path
        Path(path).parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def initialize(self) -> None:
        with self.connect() as connection:
            connection.executescript(SCHEMA)
            columns = {row["name"] for row in connection.execute("PRAGMA table_info(mandates)")}
            if "blockchain_network" not in columns:
                connection.execute("ALTER TABLE mandates ADD COLUMN blockchain_network TEXT")
            if "tx_hash" not in columns:
                connection.execute("ALTER TABLE mandates ADD COLUMN tx_hash TEXT")

    @contextmanager
    def transaction(self):
        connection = self.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()
