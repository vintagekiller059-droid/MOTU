"""SQLite Database connection layer with SQLite WAL mode enabled for fast concurrent read/write."""

import sqlite3
from typing import Generator
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger("Database")


class DatabaseManager:
    """Manages SQLite connection lifecycle and schema setup."""

    def __init__(self, db_path: str):
        self.db_path = str(db_path)

    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Context generator for API dependencies."""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def initialize_tables(self) -> None:
        """Initializes system tables with WAL mode enabled."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # Enable Write-Ahead Logging for better concurrency
                cursor.execute("PRAGMA journal_mode=WAL;")
                
                # Baseline Telemetry Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS system_telemetry (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        event_type TEXT NOT NULL,
                        details TEXT
                    )
                """)
                conn.commit()
            logger.info("Database initialized with WAL mode enabled.")
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize SQLite database: {e}")
            raise e


db_manager = DatabaseManager(settings.DATABASE_PATH)