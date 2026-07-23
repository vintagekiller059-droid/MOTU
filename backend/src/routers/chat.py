# backend/app/routers/chat.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json
import httpx

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/stream")
async def chat_stream(request: dict):
    print("[MOTU] ✓ Router entered")
    
    session_id = request.get("session_id")
    message = request.get("message")
    
    if not session_id or not message:
        raise HTTPException(status_code=400, detail="Missing session_id or message")
    
    print(f"[MOTU] ✓ Session loaded: {session_id}")
    
    # Load session from DB (your existing code)
    # ...
    
    async def event_generator():
        print("[MOTU] ✓ Ollama connected")
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                "http://localhost:11434/api/generate",
                json={
                    "model": "your-model-name",  # e.g., "llama3", "mistral"
                    "prompt": message,
                    "stream": True,
                },
                timeout=300.0,
            ) as response:
                
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        token = data.get("response", "")
                        
                        if token:
                            # Proper SSE format: event name + data JSON
                            event_payload = json.dumps({"token": token})
                            print(f"[MOTU] ✓ Token generated: {token!r}")
                            yield f"event: token\ndata: {event_payload}\n\n"
                            print("[MOTU] ✓ SSE emitted")
                        
                        if data.get("done"):
                            done_payload = json.dumps({"done": True})
                            yield f"event: done\ndata: {done_payload}\n\n"
                            print("[MOTU] ✓ Stream finished")
                            break
                            
                    except json.JSONDecodeError:
                        continue
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )