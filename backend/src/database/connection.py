"""SQLite engine + session factory."""

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker

from config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _):
    """Enable WAL mode + foreign keys for better concurrency and integrity."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _create_fts5_tables(connection) -> None:
    """Create FTS5 virtual table and triggers for memory search."""
    connection.execute(text("""
        CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
            content,
            content_rowid=rowid,
            content='memory_entries'
        )
    """))

    connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS memory_entries_ai AFTER INSERT ON memory_entries
        BEGIN
            INSERT INTO memory_fts(rowid, content) VALUES (new.rowid, new.content);
        END
    """))

    connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS memory_entries_ad AFTER DELETE ON memory_entries
        BEGIN
            INSERT INTO memory_fts(memory_fts, rowid, content)
            VALUES ('delete', old.rowid, old.content);
        END
    """))

    connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS memory_entries_au AFTER UPDATE ON memory_entries
        BEGIN
            INSERT INTO memory_fts(memory_fts, rowid, content)
            VALUES ('delete', old.rowid, old.content);
            INSERT INTO memory_fts(rowid, content)
            VALUES (new.rowid, new.content);
        END
    """))


def _create_memory_indexes(connection) -> None:
    """Create indexes for memory_entries and memory_entry_tags."""
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_importance ON memory_entries(importance DESC, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_pinned ON memory_entries(is_pinned) WHERE is_pinned = 1",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_access ON memory_entries(access_count DESC)",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_type ON memory_entries(entry_type, importance DESC)",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_source ON memory_entries(source)",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_schema ON memory_entries(schema_version)",
        "CREATE INDEX IF NOT EXISTS idx_memory_entries_session ON memory_entries(source_session_id)",
        "CREATE INDEX IF NOT EXISTS idx_memory_tags_tag ON memory_entry_tags(tag)",
    ]
    for idx in indexes:
        connection.execute(text(idx))


def init_db() -> None:
    """Create all tables if they don't exist yet."""
    from models.database import Base

    Base.metadata.create_all(bind=engine)

    with engine.connect() as connection:
        _create_fts5_tables(connection)
        _create_memory_indexes(connection)
        connection.commit()
