# ============================================================================
# Course: Multimedia Systems & Programming
# Backend: FastAPI Main Application
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from section03_router import router as section03_router

app = FastAPI(
    title="Multimedia Lab - FastAPI Processing Backend",
    description="Educational REST API for Multimedia Systems & Programming Curriculum at Sinai University",
    version="1.0.0"
)

# Enable CORS for frontend cross-origin communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Section 03 Router
app.include_router(section03_router)

# Mount outputs directory if it exists
outputs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
if os.path.exists(outputs_dir):
    app.mount("/outputs", StaticFiles(directory=outputs_dir), name="outputs")


@app.get("/")
async def root():
    return {
        "project": "Multimedia Lab API",
        "institution": "Sinai University",
        "active_section": "Section 03 - Image Histogram",
        "endpoints": {
            "histogram": "/api/section03/histogram",
            "mask": "/api/section03/mask",
            "verify_tasks": "/api/section03/verify-tasks"
        }
    }


@app.get("/api/health")
async def health_check():
    return {"status": "online", "active_section": "section-03"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
