import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api.routes import router
from intelligence.asset_streamer import run_discovery_stream

# Background task reference
stream_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background streamer
    global stream_task
    loop = asyncio.get_event_loop()
    stream_task = loop.create_task(run_discovery_stream(interval_seconds=45))
    yield
    # Shutdown: Cancel the streamer
    if stream_task:
        stream_task.cancel()

app = FastAPI(
    title="Q-Guardian 2.0 API",
    description="Quantum Survival Intelligence Platform",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Q-Guardian 2.0 API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
