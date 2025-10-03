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
    password: str
    role: str = "user"

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
async def register_public(user_data: dict):
    """Public user registration"""
    username = user_data.get("username")
    password = user_data.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    # Create user with 'user' role (not admin)
    result = await db.create_user(username, password, "user")

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return {"message": "User created successfully"}

@api_router.post("/admin/register")
async def register_admin(user_create: UserCreate, current_user: dict = Depends(get_current_admin_user)):
    """Create new user (admin only)"""
    result = await db.create_user(user_create.username, user_create.password, user_create.role)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result

@api_router.get("/users")
async def get_users(current_user: dict = Depends(get_current_admin_user)):
    """Get all users (admin only)"""
    users = await db.get_users()
    return {"users": users}

@api_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {"user": current_user}

# Receipt scanning endpoints
@api_router.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
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
async def confirm_receipt_items(items_data: dict):
    """
    Add confirmed receipt items to the grocery database
    """
    try:
        # Extract items and store info from the request
        items = items_data.get('items', [])
        store_name = items_data.get('store_name', 'Unknown Store')

        if not items:
            raise HTTPException(status_code=400, detail="No items provided")

        # Add items to database
        added_items = []
        for item in items:
            grocery_item_data = {
                "itemName": item.get('name', 'Unknown Item'),
                "store": store_name,
                "quantity": item.get('quantity', '1 kg'),
                "price": float(item.get('total_price', 0)),
                "date": datetime.utcnow().strftime('%Y-%m-%d')
            }

            # Save to SQLite database
            saved_item = await db.add_grocery_item(grocery_item_data)
            added_items.append(saved_item)

        return {
            "success": True,
            "message": f"Added {len(added_items)} items to your grocery list",
            "added_items": added_items
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
