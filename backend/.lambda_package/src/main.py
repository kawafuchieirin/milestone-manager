from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from src.api.routes import goals_router, milestones_router
from src.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Milestone Manager API",
    description="Goal and milestone management API",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://dup715o0rkbl.cloudfront.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(goals_router, prefix="/api")
app.include_router(milestones_router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.environment}


# Lambda handler
handler = Mangum(app, lifespan="off")
