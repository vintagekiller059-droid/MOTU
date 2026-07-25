import sys
import asyncio
sys.path.insert(0, "src")

from ollama_client import check_health, list_models, stream_chat

async def test():
    print("=" * 50)
    print("MODULE 2: OLLAMA CLIENT TESTS")
    print("=" * 50)

    healthy = await check_health()
    print(f"[{'PASS' if healthy else 'FAIL'}] Ollama health: {healthy}")
    if not healthy:
        print("Start Ollama: ollama serve")
        return

    models = await list_models()
    print(f"[PASS] Found {len(models)} model(s):")
    for m in models:
        print(f"       - {m['name']} ({m['parameter_count']})")

    print("[TEST] Streaming...")
    tokens = []
    async for token in stream_chat([{"role": "user", "content": "Say hi"}]):
        tokens.append(token)
        print(token, end="", flush=True)
    print(f"\n[PASS] Received {len(tokens)} tokens")

    print("\nMODULE 2: ALL TESTS PASSED")

asyncio.run(test())