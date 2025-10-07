from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import jwt
from datetime import datetime, timedelta
from services.receipt_processor import ReceiptProcessor
from database import db


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(
    title="GroziOne API",
    description="Smart grocery companion with AI-powered receipt scanning",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize receipt processor
receipt_processor = ReceiptProcessor()


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "grozione-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Authentication Models
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    role: str = "user"

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Authentication Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return {"user_id": user_id, "username": payload.get("username"), "role": payload.get("role")}
    except jwt.PyJWTError:
        raise credentials_exception

async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Welcome to GroziOne API", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = await db.create_status_check(status_dict["client_name"])
    return StatusCheck(**status_obj)

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.get_status_checks()
    return [StatusCheck(**status_check) for status_check in status_checks]

# Authentication endpoints
@api_router.post("/login", response_model=Token)
async def login(user_login: UserLogin):
    """Authenticate user and return JWT token"""
    result = await db.authenticate_user(user_login.username, user_login.password)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["message"],
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "user_id": result["user"]["id"],
            "username": result["user"]["username"],
            "role": result["user"]["role"]
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": result["user"]
    }

@api_router.post("/register")
async def register_public(user_data: UserRegister):
    """Public user registration with email"""
    if not user_data.username or not user_data.password or not user_data.email:
        raise HTTPException(status_code=400, detail="Username, email, and password are required")

    # Validate email format
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Create user with 'user' role (not admin)
    result = await db.create_user(user_data.username, user_data.password, "user", user_data.email)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return {"message": "User created successfully"}

@api_router.post("/admin/register")
async def register_admin(user_create: UserCreate, current_user: dict = Depends(get_current_admin_user)):
    """Create new user (admin only)"""
    result = await db.create_user(user_create.username, user_create.password, user_create.role, user_create.email)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result

@api_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset - sends reset token"""
    # Get user by email
    user = await db.get_user_by_email(request.email)

    if not user:
        # Don't reveal if email exists or not for security
        return {
            "success": True,
            "message": "If the email exists, a password reset link will be sent"
        }

    # Create reset token
    token = await db.create_password_reset_token(user["id"])

    # In a real application, you would send this token via email
    # For now, we'll return it in the response (NOT SECURE FOR PRODUCTION)
    logger.info(f"Password reset token for {request.email}: {token}")

    return {
        "success": True,
        "message": "Password reset token generated",
        "token": token,  # Remove this in production - send via email instead
        "note": "In production, this token should be sent via email, not returned in response"
    }

@api_router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    if not request.new_password or len(request.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )

    result = await db.reset_password(request.token, request.new_password)

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    return result

@api_router.get("/users")
async def get_users(current_user: dict = Depends(get_current_admin_user)):
    """Get all users (admin only)"""
    users = await db.get_users()
    return {"users": users}

@api_router.put("/admin/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update user details (admin only)"""
    username = user_data.get("username")
    password = user_data.get("password")
    role = user_data.get("role")

    result = await db.update_user(user_id, username, password, role)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete user (admin only)"""
    # Prevent admin from deleting themselves
    if user_id == current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    result = await db.delete_user(user_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )

    return result

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(get_current_admin_user)):
    """Get admin dashboard statistics"""
    stats = await db.get_user_activity_stats()
    return stats

@api_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {"user": current_user}

# Receipt scanning endpoints
@api_router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Process receipt image and extract structured grocery data
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in ['jpg', 'jpeg', 'png']:
            raise HTTPException(
                status_code=400, 
                detail="File type not allowed. Supported: jpg, jpeg, png"
            )
        
        # Check file size (10MB limit)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413, 
                detail="File too large. Maximum size: 10MB"
            )
        
        # Process receipt
        result = await receipt_processor.process_receipt(content)
        
        # Add metadata
        result["file_info"] = {
            "original_filename": file.filename,
            "file_size": len(content),
            "processing_status": "success"
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@api_router.post("/confirm-receipt-items")
async def confirm_receipt_items(
    items_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Add confirmed receipt items to the grocery database
    """
    try:
        # Extract items and store info from the request
        items = items_data.get('items', [])
        store_name = items_data.get('store_name', 'Unknown Store')
        user_id = current_user.get("user_id", 1)

        if not items:
            raise HTTPException(status_code=400, detail="No items provided")

        # Add items to database
        added_items = []
        total_amount = 0.0

        for item in items:
            grocery_item_data = {
                "itemName": item.get('name', 'Unknown Item'),
                "store": store_name,
                "quantity": item.get('quantity', '1 kg'),
                "price": float(item.get('total_price', 0)),
                "date": datetime.utcnow().strftime('%Y-%m-%d')
            }

            # Save to SQLite database
            saved_item = await db.add_grocery_item(grocery_item_data, user_id)
            added_items.append(saved_item)
            total_amount += float(item.get('total_price', 0))

        # Save receipt scan record
        scan_data = {
            "filename": items_data.get('filename', 'receipt.jpg'),
            "file_size": items_data.get('file_size', 0),
            "processing_status": "success",
            "confidence_score": items_data.get('confidence', 0.9),
            "store_name": store_name,
            "total_amount": total_amount,
            "items_count": len(items),
            "scan_result": items_data
        }

        scan_id = await db.save_receipt_scan(scan_data, user_id)

        return {
            "success": True,
            "message": f"Added {len(added_items)} items to your grocery list",
            "added_items": added_items,
            "scan_id": scan_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add items: {str(e)}")

# Grocery items management endpoints
@api_router.get("/grocery-items")
async def get_grocery_items(current_user: dict = Depends(get_current_user)):
    """Get all grocery items for current user"""
    try:
        items = await db.get_grocery_items(user_id=current_user["user_id"])
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get items: {str(e)}")

@api_router.post("/grocery-items")
async def add_grocery_item(item_data: dict, current_user: dict = Depends(get_current_user)):
    """Add a single grocery item"""
    try:
        saved_item = await db.add_grocery_item(item_data, user_id=current_user["user_id"])
        return {"success": True, "item": saved_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add item: {str(e)}")

@api_router.put("/grocery-items/{item_id}")
async def update_grocery_item(item_id: str, item_data: dict, current_user: dict = Depends(get_current_user)):
    """Update a grocery item"""
    try:
        updated_item = await db.update_grocery_item(item_id, item_data, user_id=current_user["user_id"])
        if updated_item:
            return {"success": True, "item": updated_item}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update item: {str(e)}")

@api_router.delete("/grocery-items/{item_id}")
async def delete_grocery_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a grocery item"""
    try:
        success = await db.delete_grocery_item(item_id, user_id=current_user["user_id"])
        if success:
            return {"success": True, "message": "Item deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS middleware
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
cors_origins = [origin.strip() for origin in cors_origins]  # Remove whitespace

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Production server entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    logger.info(f"🚀 Starting GroziOne API server on {host}:{port}")
    logger.info(f"📝 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"📚 API Documentation: http://{host}:{port}/docs")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
