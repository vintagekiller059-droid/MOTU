import sys
sys.path.insert(0, "src")

from config import settings
from idgen import uuid7, uuid7_to_datetime
from db import init_db, engine
from orm import Session, Message
from schemas import ChatRequest, HealthResponse
from sqlalchemy import inspect
import time
import os

print("=" * 50)
print("MODULE 1: FOUNDATION TESTS")
print("=" * 50)

# Test config
assert settings.MODEL_NAME == "qwen2.5:1.5b"
print("[PASS] config.py")

# Test idgen
id1 = uuid7()
time.sleep(0.01)
id2 = uuid7()
assert len(id1) == 36
assert id1 < id2
ts = uuid7_to_datetime(id1)
assert abs(time.time() - ts) < 1.0
print("[PASS] idgen.py")

# Test database + models
if os.path.exists("motu.db"):
    os.remove("motu.db")
init_db()
tables = inspect(engine).get_table_names()
assert "sessions" in tables
assert "messages" in tables
print("[PASS] db.py + orm.py")

# Test schemas
req = ChatRequest(message="hi")
assert req.message == "hi"
print("[PASS] schemas.py")

print("\n" + "=" * 50)
print("MODULE 1: ALL TESTS PASSED")
print("=" * 50)