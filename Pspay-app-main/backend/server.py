from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv
import base64
import shutil
import mimetypes

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'paycoin_db')]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Paycoin API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserType(str):
    CLIENT = "client"
    MERCHANT = "merchant"

class Address(BaseModel):
    street: str
    number: str
    city: str
    state: str
    zip_code: str
    country: str = "Brasil"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    user_type: str  # "client" or "merchant"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    name: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    address: Optional[Address] = None
    # Merchant specific fields
    business_name: Optional[str] = None
    business_description: Optional[str] = None
    business_banner: Optional[str] = None
    business_category: Optional[str] = None

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    profile: Optional[UserProfile] = None
    wallet_address: Optional[str] = None
    profile_image_url: Optional[str] = None
    banner_image_url: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: str

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    amount: float
    token_type: str  # "PSPAY" or "USDT"
    transaction_hash: Optional[str] = None
    status: str = "pending"  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = None

class Store(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    merchant_id: str
    name: str
    description: Optional[str] = None
    address: Address
    category: Optional[str] = None
    phone: Optional[str] = None
    business_hours: Optional[Dict[str, str]] = None
    images: Optional[List[str]] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    merchant_id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "BRL"
    category: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

# Authentication routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    del user_dict["password"]
    user_dict["hashed_password"] = hashed_password
    user_obj = User(**user_dict)
    
    await db.users.insert_one(user_obj.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_obj.id}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_type=user_obj.user_type,
        user_id=user_obj.id
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_type=user["user_type"],
        user_id=user["id"]
    )

# User profile routes
@api_router.get("/user/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/user/profile")
async def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user)
):
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"profile": profile.dict()}}
    )
    return {"message": "Profile updated successfully"}

@api_router.post("/user/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Simple base64 encoding for image storage (in production, use cloud storage)
    content = await file.read()
    encoded_image = base64.b64encode(content).decode('utf-8')
    image_data = f"data:{file.content_type};base64,{encoded_image}"
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"profile.profile_picture": image_data}}
    )
    
    return {"message": "Image uploaded successfully", "image_url": image_data}

# Store management routes
@api_router.post("/stores")
async def create_store(
    store_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    if current_user.user_type != UserType.MERCHANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can create stores"
        )
    
    store = Store(merchant_id=current_user.id, **store_data)
    await db.stores.insert_one(store.dict())
    return store

@api_router.get("/stores", response_model=List[Store])
async def get_stores():
    stores = await db.stores.find({"is_active": True}).to_list(1000)
    return [Store(**store) for store in stores]

@api_router.get("/my-stores", response_model=List[Store])
async def get_my_stores(current_user: User = Depends(get_current_user)):
    if current_user.user_type != UserType.MERCHANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access this endpoint"
        )
    
    stores = await db.stores.find({"merchant_id": current_user.id}).to_list(1000)
    return [Store(**store) for store in stores]

# Product management routes
@api_router.post("/products")
async def create_product(
    product_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    if current_user.user_type != UserType.MERCHANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can create products"
        )
    
    product = Product(merchant_id=current_user.id, **product_data)
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products(merchant_id: Optional[str] = None):
    query = {"is_active": True}
    if merchant_id:
        query["merchant_id"] = merchant_id
    
    products = await db.products.find(query).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/my-products", response_model=List[Product])
async def get_my_products(current_user: User = Depends(get_current_user)):
    if current_user.user_type != UserType.MERCHANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access this endpoint"
        )
    
    products = await db.products.find({"merchant_id": current_user.id}).to_list(1000)
    return [Product(**product) for product in products]

# Transaction routes
@api_router.post("/transactions")
async def create_transaction(
    transaction_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    transaction = Transaction(from_user_id=current_user.id, **transaction_data)
    await db.transactions.insert_one(transaction.dict())
    return transaction

@api_router.get("/transactions", response_model=List[Transaction])
async def get_user_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({
        "$or": [
            {"from_user_id": current_user.id},
            {"to_user_id": current_user.id}
        ]
    }).to_list(1000)
    return [Transaction(**transaction) for transaction in transactions]

# Dashboard analytics for merchants
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    if current_user.user_type != UserType.MERCHANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access analytics"
        )
    
    # Get transaction analytics
    pipeline = [
        {"$match": {"to_user_id": current_user.id}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$amount"},
            "transaction_count": {"$sum": 1},
            "avg_transaction": {"$avg": "$amount"}
        }}
    ]
    
    result = await db.transactions.aggregate(pipeline).to_list(1)
    analytics = result[0] if result else {
        "total_revenue": 0,
        "transaction_count": 0,
        "avg_transaction": 0
    }
    
    return analytics

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Upload endpoints
@app.post("/api/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    image_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile image or banner for user"""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Formato de arquivo não suportado. Use JPEG, PNG ou WebP."
            )
        
        # Validate file size (5MB max)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=400,
                detail="Arquivo muito grande. Tamanho máximo: 5MB."
            )
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{current_user['id']}_{image_type}_{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Update user record with image URL
        image_url = f"/uploads/{unique_filename}"
        field_name = "profile_image_url" if image_type == "profile" else "banner_image_url"
        
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": {field_name: image_url, "updated_at": datetime.utcnow()}}
        )
        
        return {"image_url": image_url, "message": "Upload realizado com sucesso"}
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/api/upload/image/{image_type}")
async def remove_image(
    image_type: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove profile image or banner for user"""
    try:
        if image_type not in ["profile", "banner"]:
            raise HTTPException(status_code=400, detail="Tipo de imagem inválido")
        
        field_name = "profile_image_url" if image_type == "profile" else "banner_image_url"
        
        # Get current image URL to delete file
        user = await db.users.find_one({"id": current_user['id']})
        if user and user.get(field_name):
            # Remove file from filesystem
            try:
                file_path = Path(".") / user[field_name].lstrip("/")
                if file_path.exists():
                    file_path.unlink()
            except Exception as e:
                logger.warning(f"Could not delete file: {e}")
        
        # Update user record
        await db.users.update_one(
            {"id": current_user['id']},
            {"$unset": {field_name: ""}, "$set": {"updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Imagem removida com sucesso"}
        
    except Exception as e:
        logger.error(f"Remove image error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()