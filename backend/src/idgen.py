"""Time-ordered UUIDv7 generator (RFC 9562)."""

import time
import uuid


def uuid7() -> str:
    timestamp_ms = int(time.time() * 1000)
    timestamp_bytes = timestamp_ms.to_bytes(6, "big")
    rand_bytes = uuid.uuid4().bytes
    v7 = bytearray(16)
    v7[0:6] = timestamp_bytes
    v7[6] = (rand_bytes[6] & 0x0F) | 0x70
    v7[7] = (rand_bytes[7] & 0x3F) | 0x80
    v7[8:16] = rand_bytes[8:16]
    return str(uuid.UUID(bytes=bytes(v7)))


def uuid7_to_datetime(uuid_str: str) -> float:
    u = uuid.UUID(uuid_str)
    timestamp_ms = int.from_bytes(u.bytes[0:6], "big")
    return timestamp_ms / 1000.0
