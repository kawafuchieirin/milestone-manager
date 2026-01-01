#!/usr/bin/env python3
"""
Local development server for the Milestone Manager API.

Usage:
    python run_local.py

Requires:
    - DynamoDB Local running on port 8000 (optional)
    - Environment variables set (or .env file)
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
    )
