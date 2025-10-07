"""
Configuration management for GroziOne backend
Handles environment-specific settings
"""

import os
from typing import List
from pathlib import Path


class Settings:
    """Application settings loaded from environment variables"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "grozione.db")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    
    # Azure Document Intelligence
    AZURE_ENDPOINT: str = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "")
    AZURE_KEY: str = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "")
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if ENVIRONMENT == "production" else "DEBUG")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # File Upload
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", str(10 * 1024 * 1024)))  # 10MB default
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "pdf"]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT == "development"
    
    @property
    def database_url(self) -> str:
        """Get database URL/path"""
        return self.DATABASE_PATH
    
    def validate(self) -> None:
        """Validate critical settings"""
        if self.is_production:
            # Check critical production settings
            if self.JWT_SECRET_KEY == "dev-secret-key-change-in-production":
                raise ValueError("JWT_SECRET_KEY must be changed in production!")
            
            if len(self.JWT_SECRET_KEY) < 32:
                raise ValueError("JWT_SECRET_KEY must be at least 32 characters long!")
            
            if not self.AZURE_ENDPOINT or not self.AZURE_KEY:
                print("⚠️  Warning: Azure Document Intelligence not configured. Receipt scanning will not work.")
            
            # Ensure CORS is properly configured
            if "localhost" in ",".join(self.CORS_ORIGINS):
                print("⚠️  Warning: localhost in CORS origins for production environment!")
    
    def __repr__(self) -> str:
        """String representation (safe - no secrets)"""
        return (
            f"Settings(\n"
            f"  ENVIRONMENT={self.ENVIRONMENT}\n"
            f"  DATABASE_PATH={self.DATABASE_PATH}\n"
            f"  CORS_ORIGINS={self.CORS_ORIGINS}\n"
            f"  AZURE_CONFIGURED={bool(self.AZURE_ENDPOINT and self.AZURE_KEY)}\n"
            f"  PORT={self.PORT}\n"
            f")"
        )


# Global settings instance
settings = Settings()

# Validate settings on import
try:
    settings.validate()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    if settings.is_production:
        raise


# Export for convenience
__all__ = ["settings"]

