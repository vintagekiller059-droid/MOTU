import asyncio
import httpx

async def test_ollama_stream():
    print("--> Testing connection to Ollama...")
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "qwen2.5:1.5b",  # Updated to qwen2.5:1.5b
        "prompt": "Hello",
        "stream": True
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                print(f"--> Ollama status code: {response.status_code}")
                async for line in response.aiter_lines():
                    if line:
                        print(f"RECEIVED CHUNK: {line[:50]}...")
                        break
        print("--> Ollama connection test SUCCESS")
    except Exception as e:
        print(f"--> OLLAMA FAILED: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_ollama_stream())