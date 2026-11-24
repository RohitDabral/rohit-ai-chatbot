import os
import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from config import settings

def get_db_path() -> str:
    db_url = settings.DATABASE_URL
    if db_url == ":memory:":
        return ":memory:"
    # Parse sqlite:/// or sqlite:////
    if db_url.startswith("sqlite:////"):
        path = "/" + db_url[len("sqlite:////"):]
    elif db_url.startswith("sqlite:///"):
        path = db_url[len("sqlite:///"):]
    elif db_url.startswith("sqlite://"):
        path = db_url[len("sqlite://"):]
    else:
        path = db_url
    
    # Ensure directory exists if not memory and directory specified
    dirname = os.path.dirname(path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    return path

class Database:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or get_db_path()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Creates the messages table and necessary indexes automatically on startup."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT NOT NULL
                );
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_session_id 
                ON messages(session_id, id ASC);
            """)
            conn.commit()

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """Stores a message in SQLite per session_id."""
        meta_str = json.dumps(metadata) if metadata is not None else None
        created_at = datetime.now(timezone.utc).isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO messages (session_id, role, content, metadata, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (session_id, role, content, meta_str, created_at)
            )
            conn.commit()
            return cursor.lastrowid

    def session_exists(self, session_id: str) -> bool:
        """Checks if a session has any stored messages."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM messages WHERE session_id = ? LIMIT 1",
                (session_id,)
            )
            return cursor.fetchone() is not None

    def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Returns stored history of one session from SQLite, oldest first,
        without the system prompt.
        Formats assistant messages with parsed metadata.
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT role, content, metadata
                FROM messages
                WHERE session_id = ?
                ORDER BY id ASC
                """,
                (session_id,)
            )
            rows = cursor.fetchall()
            
        result = []
        for row in rows:
            msg: Dict[str, Any] = {
                "role": row["role"],
                "content": row["content"]
            }
            if row["role"] == "assistant":
                if row["metadata"]:
                    try:
                        msg["metadata"] = json.loads(row["metadata"])
                    except Exception:
                        msg["metadata"] = {}
                else:
                    msg["metadata"] = {}
            result.append(msg)
        return result

    def check_health(self) -> bool:
        """Verify database reachability."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                return cursor.fetchone() is not None
        except Exception:
            return False

db = Database()
