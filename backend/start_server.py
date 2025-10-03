#!/usr/bin/env python3
"""Start the GroziOne FastAPI server"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Set the working directory to the backend folder
    os.chdir(Path(__file__).parent)
    
    print("🚀 Starting GroziOne Backend Server...")
    print("📍 Backend URL: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    print("=" * 50)
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
