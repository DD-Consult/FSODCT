from fastapi import FastAPI, APIRouter, Cookie, Response, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    password_hash: Optional[str] = None  # For manual login users
    auth_type: str = "oauth"  # "oauth" or "manual"

class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_token: str
    user_id: str
    expires_at: datetime

class ManualLoginRequest(BaseModel):
    username: str
    password: str

class ManualRegisterRequest(BaseModel):
    username: str
    password: str
    name: str

class LearnerRegistration(BaseModel):
    name: str
    email: str
    cohort: str  # "VET", "First Nations", "Other"
    phone: Optional[str] = None
    class_type: str = "Digital"  # "Digital", "Face-to-Face", "Both"
    
class Learner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    cohort: str
    phone: Optional[str] = None
    class_type: str = "Digital"
    enrolled_modules: List[str] = []
    completed_modules: List[str] = []
    current_module: Optional[str] = None
    progress_percentage: int = 0
    registration_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    
class ModuleProgress(BaseModel):
    learner_id: str
    module_id: str
    progress: int  # 0-100
    completed: bool = False
    last_accessed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= AUTH ENDPOINTS =============

# Manual Login/Register Endpoints
@api_router.post("/auth/register")
async def register_user(request: ManualRegisterRequest):
    """Register a new user with username/password"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": request.username}, {"_id": 0})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Hash password
        password_hash = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=request.username,
            name=request.name,
            password_hash=password_hash,
            auth_type="manual"
        )
        
        await db.users.insert_one(user.model_dump())
        
        return {"success": True, "message": "User registered successfully"}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login_user(request: ManualLoginRequest, response: Response):
    """Login with username/password"""
    try:
        # Find user
        user = await db.users.find_one({"email": request.username}, {"_id": 0})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Verify password
        if not user.get("password_hash"):
            raise HTTPException(status_code=401, detail="This account uses OAuth login")
        
        if not bcrypt.checkpw(request.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Create session
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = Session(
            session_token=session_token,
            user_id=user["id"],
            expires_at=expires_at
        )
        
        # Store in DB
        session_dict = session.model_dump()
        session_dict["expires_at"] = session_dict["expires_at"].isoformat()
        await db.sessions.insert_one(session_dict)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        return {"success": True, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# OAuth Endpoints
@api_router.post("/auth/session")
async def create_session(session_id: str, response: Response):
    """Process session_id from Emergent OAuth and create backend session"""
    try:
        # Call Emergent session API
        headers = {"X-Session-ID": session_id}
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers=headers
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session_data = resp.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
        
        if not existing_user:
            # Create new user
            user = User(
                id=session_data["id"],
                email=session_data["email"],
                name=session_data["name"],
                picture=session_data.get("picture")
            )
            await db.users.insert_one(user.model_dump())
            user_id = user.id
        else:
            user_id = existing_user["id"]
        
        # Create backend session
        session_token = session_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = Session(
            session_token=session_token,
            user_id=user_id,
            expires_at=expires_at
        )
        
        # Store in DB
        session_dict = session.model_dump()
        session_dict["expires_at"] = session_dict["expires_at"].isoformat()
        await db.sessions.insert_one(session_dict)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        return {"success": True, "user_id": user_id}
    
    except Exception as e:
        logging.error(f"Session creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_current_user(session_token: Optional[str] = Cookie(None)):
    """Dependency to get current authenticated user"""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get session from DB
    session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = datetime.fromisoformat(session["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    # Remove sensitive data before returning
    user_data = current_user.model_dump()
    user_data.pop("password_hash", None)
    return user_data

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"success": True}

# ============= LEARNER PORTAL ENDPOINTS =============

@api_router.post("/learners/register")
async def register_learner(learner_data: LearnerRegistration):
    """Register a new learner for training"""
    try:
        # Check if learner already exists
        existing = await db.learners.find_one({"email": learner_data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create learner
        learner = Learner(
            name=learner_data.name,
            email=learner_data.email,
            cohort=learner_data.cohort,
            phone=learner_data.phone,
            class_type=learner_data.class_type,
            enrolled_modules=["module1", "module2", "module3"],  # Auto-enroll in all modules
            current_module="module1"
        )
        
        await db.learners.insert_one(learner.model_dump())
        
        # Create a simple session for learner
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        
        learner_session = {
            "session_token": session_token,
            "learner_id": learner.id,
            "expires_at": expires_at.isoformat(),
            "type": "learner"
        }
        await db.learner_sessions.insert_one(learner_session)
        
        return {
            "success": True,
            "learner_id": learner.id,
            "session_token": session_token,
            "message": "Registration successful! Welcome to FSO Digital Capability Training."
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Learner registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/learners/login")
async def learner_login(email: str):
    """Simple learner login with email"""
    try:
        learner = await db.learners.find_one({"email": email}, {"_id": 0})
        if not learner:
            raise HTTPException(status_code=404, detail="Learner not found. Please register first.")
        
        # Create session
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        
        learner_session = {
            "session_token": session_token,
            "learner_id": learner["id"],
            "expires_at": expires_at.isoformat(),
            "type": "learner"
        }
        await db.learner_sessions.insert_one(learner_session)
        
        # Update last login
        await db.learners.update_one(
            {"id": learner["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            "success": True,
            "learner": learner,
            "session_token": session_token
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Learner login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/learners/dashboard/{learner_id}")
async def get_learner_dashboard(learner_id: str):
    """Get learner dashboard data"""
    try:
        learner = await db.learners.find_one({"id": learner_id}, {"_id": 0})
        if not learner:
            raise HTTPException(status_code=404, detail="Learner not found")
        
        # Mock modules data
        modules = [
            {
                "id": "module1",
                "title": "Module 1: Introduction to Digital Skills",
                "description": "Learn the fundamentals of digital literacy and online safety",
                "duration": "2 weeks",
                "difficulty": "Beginner",
                "status": "in_progress" if learner.get("current_module") == "module1" else ("completed" if "module1" in learner.get("completed_modules", []) else "locked"),
                "progress": 65 if learner.get("current_module") == "module1" else (100 if "module1" in learner.get("completed_modules", []) else 0),
                "lessons": 8,
                "completed_lessons": 5 if learner.get("current_module") == "module1" else 0
            },
            {
                "id": "module2",
                "title": "Module 2: AI Queries & Search Techniques",
                "description": "Master AI-powered search and information retrieval",
                "duration": "3 weeks",
                "difficulty": "Intermediate",
                "status": "available" if "module1" in learner.get("completed_modules", []) else "locked",
                "progress": 0,
                "lessons": 12,
                "completed_lessons": 0
            },
            {
                "id": "module3",
                "title": "Module 3: Cybersecurity Essentials",
                "description": "Protect yourself and your data online",
                "duration": "3 weeks",
                "difficulty": "Intermediate",
                "status": "locked",
                "progress": 0,
                "lessons": 10,
                "completed_lessons": 0
            }
        ]
        
        # Calculate overall progress
        total_lessons = sum(m["lessons"] for m in modules)
        completed_lessons = sum(m["completed_lessons"] for m in modules)
        overall_progress = int((completed_lessons / total_lessons) * 100)
        
        return {
            "learner": learner,
            "modules": modules,
            "overall_progress": overall_progress,
            "total_modules": len(modules),
            "completed_modules": len(learner.get("completed_modules", [])),
            "current_streak": 7,
            "total_time_spent": "12.5 hours"
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/learners/module/{module_id}")
async def get_module_content(module_id: str):
    """Get detailed module content"""
    modules_content = {
        "module1": {
            "id": "module1",
            "title": "Module 1: Introduction to Digital Skills",
            "description": "Learn the fundamentals of digital literacy and online safety",
            "duration": "2 weeks",
            "difficulty": "Beginner",
            "overview": "This module covers essential digital skills including computer basics, internet navigation, email communication, and online safety practices.",
            "lessons": [
                {"id": 1, "title": "Getting Started with Computers", "duration": "45 min", "type": "video", "completed": True},
                {"id": 2, "title": "Internet Basics", "duration": "30 min", "type": "video", "completed": True},
                {"id": 3, "title": "Email Communication", "duration": "40 min", "type": "interactive", "completed": True},
                {"id": 4, "title": "Online Safety Fundamentals", "duration": "35 min", "type": "video", "completed": True},
                {"id": 5, "title": "Password Security", "duration": "25 min", "type": "interactive", "completed": True},
                {"id": 6, "title": "Social Media Basics", "duration": "30 min", "type": "video", "completed": False},
                {"id": 7, "title": "Digital Citizenship", "duration": "40 min", "type": "reading", "completed": False},
                {"id": 8, "title": "Module Assessment", "duration": "20 min", "type": "quiz", "completed": False}
            ],
            "resources": [
                {"title": "Digital Skills Handbook", "type": "PDF", "size": "2.5 MB"},
                {"title": "Quick Reference Guide", "type": "PDF", "size": "1.2 MB"},
                {"title": "Practice Exercises", "type": "Interactive", "size": "N/A"}
            ]
        },
        "module2": {
            "id": "module2",
            "title": "Module 2: AI Queries & Search Techniques",
            "description": "Master AI-powered search and information retrieval",
            "duration": "3 weeks",
            "difficulty": "Intermediate",
            "overview": "Learn how to effectively use AI tools and advanced search techniques to find information quickly and accurately.",
            "lessons": [
                {"id": 1, "title": "Introduction to AI Search", "duration": "50 min", "type": "video", "completed": False},
                {"id": 2, "title": "Search Operators & Techniques", "duration": "45 min", "type": "interactive", "completed": False},
                {"id": 3, "title": "AI Chatbots Basics", "duration": "40 min", "type": "video", "completed": False},
                {"id": 4, "title": "Effective Query Formulation", "duration": "35 min", "type": "interactive", "completed": False},
                {"id": 5, "title": "Information Verification", "duration": "45 min", "type": "video", "completed": False},
                {"id": 6, "title": "Advanced AI Tools", "duration": "50 min", "type": "interactive", "completed": False},
                {"id": 7, "title": "Practical Applications", "duration": "40 min", "type": "video", "completed": False},
                {"id": 8, "title": "Case Studies", "duration": "30 min", "type": "reading", "completed": False},
                {"id": 9, "title": "Hands-on Practice", "duration": "60 min", "type": "interactive", "completed": False},
                {"id": 10, "title": "Ethics in AI Usage", "duration": "35 min", "type": "video", "completed": False},
                {"id": 11, "title": "Final Project", "duration": "90 min", "type": "project", "completed": False},
                {"id": 12, "title": "Module Assessment", "duration": "30 min", "type": "quiz", "completed": False}
            ],
            "resources": [
                {"title": "AI Search Guide", "type": "PDF", "size": "3.1 MB"},
                {"title": "Search Operator Cheat Sheet", "type": "PDF", "size": "800 KB"},
                {"title": "AI Tools Directory", "type": "Interactive", "size": "N/A"}
            ]
        },
        "module3": {
            "id": "module3",
            "title": "Module 3: Cybersecurity Essentials",
            "description": "Protect yourself and your data online",
            "duration": "3 weeks",
            "difficulty": "Intermediate",
            "overview": "Understand cybersecurity threats and learn practical strategies to protect your digital life.",
            "lessons": [
                {"id": 1, "title": "Cybersecurity Fundamentals", "duration": "45 min", "type": "video", "completed": False},
                {"id": 2, "title": "Common Threats & Scams", "duration": "40 min", "type": "interactive", "completed": False},
                {"id": 3, "title": "Secure Passwords & Authentication", "duration": "35 min", "type": "video", "completed": False},
                {"id": 4, "title": "Phishing Detection", "duration": "30 min", "type": "interactive", "completed": False},
                {"id": 5, "title": "Safe Browsing Practices", "duration": "40 min", "type": "video", "completed": False},
                {"id": 6, "title": "Data Privacy", "duration": "45 min", "type": "reading", "completed": False},
                {"id": 7, "title": "Mobile Security", "duration": "35 min", "type": "video", "completed": False},
                {"id": 8, "title": "Backup & Recovery", "duration": "40 min", "type": "interactive", "completed": False},
                {"id": 9, "title": "Security Tools", "duration": "50 min", "type": "video", "completed": False},
                {"id": 10, "title": "Module Assessment", "duration": "25 min", "type": "quiz", "completed": False}
            ],
            "resources": [
                {"title": "Cybersecurity Handbook", "type": "PDF", "size": "4.2 MB"},
                {"title": "Security Checklist", "type": "PDF", "size": "1.5 MB"},
                {"title": "Security Tools Guide", "type": "Interactive", "size": "N/A"}
            ]
        }
    }
    
    if module_id not in modules_content:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return modules_content[module_id]

# ============= DASHBOARD DATA ENDPOINTS =============

@api_router.get("/dashboard/overview")
async def get_dashboard_overview(current_user: User = Depends(get_current_user)):
    """Get main dashboard overview data (Screen #1)"""
    return {
        "project_vitals": {
            "status": "On Track",
            "health": {
                "budget": "On Track",
                "schedule": "On Track",
                "risk": "Low"
            },
            "current_phase": "Phase 3: Pilot, Measure, Iterate"
        },
        "recruitment_funnel": [
            {"cohort": "Cohort 1 (VET)", "recruited": 150, "target": 150, "percentage": 100, "color": "#10b981"},
            {"cohort": "Cohort 2 (First Nations)", "recruited": 100, "target": 100, "percentage": 100, "color": "#10b981"},
            {"cohort": "Cohort 3 (Other)", "recruited": 600, "target": 600, "percentage": 100, "color": "#10b981"}
        ],
        "project_milestones": [
            {"phase": "Phase 1: Foundation", "status": "Completed", "color": "#10b981"},
            {"phase": "Phase 2: Co-Design", "status": "Completed", "color": "#10b981"},
            {"phase": "Phase 3: Pilot & Iterate", "status": "In Progress", "color": "#3b82f6", "current": True},
            {"phase": "Phase 4: Full-Scale Delivery", "status": "Upcoming", "color": "#9ca3af"},
            {"phase": "Phase 5: Evaluation", "status": "Upcoming", "color": "#9ca3af"}
        ],
        "risk_heatmap": [
            {"id": 1, "risk": "Documentation Delays", "likelihood": 2, "impact": 2, "color": "#10b981"},
            {"id": 2, "risk": "Content Review Bottleneck", "likelihood": 3, "impact": 2, "color": "#f59e0b"},
            {"id": 3, "risk": "Technical Integration", "likelihood": 2, "impact": 3, "color": "#f59e0b"},
            {"id": 17, "risk": "High Learner Churn", "likelihood": 4, "impact": 4, "color": "#ef4444"}
        ],
        "ai_sentiment": {
            "overall": 78,
            "status": "Positive",
            "color": "#10b981"
        },
        "my_tasks": [
            {"id": 1, "task": "Review AI/Cyber Content (Module 3)", "due": "2025-10-28", "owner": "Priya N.", "priority": "high"},
            {"id": 2, "task": "Prepare Data for Weekly Huddle", "due": "2025-10-29", "owner": "Priya N.", "priority": "high"},
            {"id": 3, "task": "Sign-off Pilot Comms", "due": "2025-10-27", "owner": "FSO Exec", "priority": "critical"}
        ],
        "weekly_trends": [
            {"week": "Week 1", "active_learners": 832, "engagement": 88, "completion_rate": 92},
            {"week": "Week 2", "active_learners": 824, "engagement": 86, "completion_rate": 90},
            {"week": "Week 3", "active_learners": 817, "engagement": 84, "completion_rate": 88},
            {"week": "Week 4", "active_learners": 804, "engagement": 82, "completion_rate": 86},
            {"week": "Week 5", "active_learners": 780, "engagement": 75, "completion_rate": 82},
            {"week": "Week 6", "active_learners": 773, "engagement": 78, "completion_rate": 84},
            {"week": "Week 7", "active_learners": 765, "engagement": 80, "completion_rate": 85}
        ],
        "module_completion_trends": [
            {"module": "Module 1", "week1": 20, "week2": 45, "week3": 68, "week4": 82, "week5": 90, "week6": 94, "week7": 96},
            {"module": "Module 2", "week1": 0, "week2": 0, "week3": 15, "week4": 32, "week5": 48, "week6": 62, "week7": 70},
            {"module": "Module 3", "week1": 0, "week2": 0, "week3": 0, "week4": 0, "week5": 8, "week6": 22, "week7": 35}
        ],
        "support_metrics": {
            "total_tickets": 156,
            "resolved": 142,
            "pending": 14,
            "avg_resolution_time": "4.2 hours",
            "satisfaction_rate": 92
        },
        "content_effectiveness": [
            {"content_type": "Video Lessons", "effectiveness": 88, "engagement": 92},
            {"content_type": "Interactive Exercises", "effectiveness": 85, "engagement": 78},
            {"content_type": "Reading Materials", "effectiveness": 72, "engagement": 65},
            {"content_type": "Quizzes", "effectiveness": 90, "engagement": 82}
        ]
    }

@api_router.get("/dashboard/cohort/{cohort_id}")
async def get_cohort_analytics(cohort_id: int, current_user: User = Depends(get_current_user)):
    """Get cohort analytics data (Screen #2)"""
    cohort_names = {
        1: "Cohort 1 - VET",
        2: "Cohort 2 - First Nations",
        3: "Cohort 3 - Other Cohorts"
    }
    
    # Different data for each cohort to make it realistic
    cohort_data = {
        1: {  # VET Cohort
            "recruited": 150,
            "signed_up": 148,
            "onboarded": 145,
            "module1": 142,
            "module2": 138,
            "module3_in_progress": 135,
            "sentiment_words": [
                {"text": "practical", "value": 88},
                {"text": "relevant", "value": 82},
                {"text": "helpful", "value": 75},
                {"text": "clear", "value": 70},
                {"text": "engaging", "value": 65},
                {"text": "hands-on", "value": 58}
            ],
            "sentiment_timeline": [
                {"week": "Week 1", "sentiment": 82},
                {"week": "Week 2", "sentiment": 85},
                {"week": "Week 3", "sentiment": 83},
                {"week": "Week 4", "sentiment": 86},
                {"week": "Week 5", "sentiment": 84},
                {"week": "Week 6", "sentiment": 87},
                {"week": "Week 7", "sentiment": 85}
            ],
            "at_risk": [
                {"id": "C1-2015", "last_login": "5 days ago", "engagement": "Low", "sentiment": "Neutral", "action": "Email Sent"},
                {"id": "C1-2033", "last_login": "4 days ago", "engagement": "Low", "sentiment": "Negative", "action": "Chatbot Deployed"}
            ],
            "content_engagement": [
                {"module": "Module 1 (Intro)", "engagement": 94, "difficulty": 25, "color": "#10b981"},
                {"module": "Module 2 (AI Queries)", "engagement": 85, "difficulty": 60, "color": "#10b981"},
                {"module": "Module 3 (Cyber)", "engagement": 88, "difficulty": 55, "color": "#10b981"}
            ],
            "weekly_performance": [
                {"week": "Week 1", "active": 145, "completed_lessons": 420},
                {"week": "Week 2", "active": 143, "completed_lessons": 380},
                {"week": "Week 3", "active": 142, "completed_lessons": 410},
                {"week": "Week 4", "active": 140, "completed_lessons": 395},
                {"week": "Week 5", "active": 138, "completed_lessons": 405},
                {"week": "Week 6", "active": 137, "completed_lessons": 425},
                {"week": "Week 7", "active": 135, "completed_lessons": 390}
            ]
        },
        2: {  # First Nations Cohort
            "recruited": 100,
            "signed_up": 99,
            "onboarded": 97,
            "module1": 95,
            "module2": 92,
            "module3_in_progress": 90,
            "sentiment_words": [
                {"text": "cultural", "value": 92},
                {"text": "relevant", "value": 85},
                {"text": "inclusive", "value": 78},
                {"text": "respectful", "value": 72},
                {"text": "supportive", "value": 68},
                {"text": "community", "value": 62}
            ],
            "sentiment_timeline": [
                {"week": "Week 1", "sentiment": 88},
                {"week": "Week 2", "sentiment": 90},
                {"week": "Week 3", "sentiment": 89},
                {"week": "Week 4", "sentiment": 91},
                {"week": "Week 5", "sentiment": 87},
                {"week": "Week 6", "sentiment": 89},
                {"week": "Week 7", "sentiment": 90}
            ],
            "at_risk": [
                {"id": "C2-3012", "last_login": "3 days ago", "engagement": "Medium", "sentiment": "Neutral", "action": "Cultural Liaison Assigned"}
            ],
            "content_engagement": [
                {"module": "Module 1 (Intro)", "engagement": 96, "difficulty": 22, "color": "#10b981"},
                {"module": "Module 2 (AI Queries)", "engagement": 88, "difficulty": 58, "color": "#10b981"},
                {"module": "Module 3 (Cyber)", "engagement": 92, "difficulty": 50, "color": "#10b981"}
            ],
            "weekly_performance": [
                {"week": "Week 1", "active": 97, "completed_lessons": 285},
                {"week": "Week 2", "active": 96, "completed_lessons": 270},
                {"week": "Week 3", "active": 95, "completed_lessons": 280},
                {"week": "Week 4", "active": 94, "completed_lessons": 275},
                {"week": "Week 5", "active": 92, "completed_lessons": 265},
                {"week": "Week 6", "active": 91, "completed_lessons": 285},
                {"week": "Week 7", "active": 90, "completed_lessons": 270}
            ]
        },
        3: {  # Other Cohort
            "recruited": 600,
            "signed_up": 598,
            "onboarded": 590,
            "module1": 580,
            "module2": 550,
            "module3_in_progress": 540,
            "sentiment_words": [
                {"text": "confusing", "value": 85},
                {"text": "Module 2", "value": 78},
                {"text": "AI queries", "value": 72},
                {"text": "stuck", "value": 68},
                {"text": "difficult", "value": 55},
                {"text": "help needed", "value": 48}
            ],
            "sentiment_timeline": [
                {"week": "Week 1", "sentiment": 85},
                {"week": "Week 2", "sentiment": 82},
                {"week": "Week 3", "sentiment": 78},
                {"week": "Week 4", "sentiment": 75},
                {"week": "Week 5", "sentiment": 58},
                {"week": "Week 6", "sentiment": 62},
                {"week": "Week 7", "sentiment": 68}
            ],
            "at_risk": [
                {"id": "C3-4015", "last_login": "4 days ago", "engagement": "Low", "sentiment": "Negative", "action": "Chatbot Deployed"},
                {"id": "C3-4022", "last_login": "3 days ago", "engagement": "Low", "sentiment": "Negative", "action": "Chatbot Deployed"},
                {"id": "C3-4051", "last_login": "5 days ago", "engagement": "Very Low", "sentiment": "N/A", "action": "Escalate to Trainer"},
                {"id": "C3-4088", "last_login": "6 days ago", "engagement": "Very Low", "sentiment": "Negative", "action": "Escalate to Trainer"},
                {"id": "C3-4102", "last_login": "2 days ago", "engagement": "Low", "sentiment": "Negative", "action": "Chatbot Deployed"}
            ],
            "content_engagement": [
                {"module": "Module 1 (Intro)", "engagement": 92, "difficulty": 20, "color": "#10b981"},
                {"module": "Module 2 (AI Queries)", "engagement": 58, "difficulty": 85, "color": "#ef4444"},
                {"module": "Module 3 (Cyber)", "engagement": 78, "difficulty": 55, "color": "#f59e0b"}
            ],
            "weekly_performance": [
                {"week": "Week 1", "active": 590, "completed_lessons": 1850},
                {"week": "Week 2", "active": 585, "completed_lessons": 1720},
                {"week": "Week 3", "active": 580, "completed_lessons": 1680},
                {"week": "Week 4", "active": 570, "completed_lessons": 1590},
                {"week": "Week 5", "active": 550, "completed_lessons": 1420},
                {"week": "Week 6", "active": 545, "completed_lessons": 1480},
                {"week": "Week 7", "active": 540, "completed_lessons": 1520}
            ]
        }
    }
    
    data = cohort_data.get(cohort_id, cohort_data[3])
    
    return {
        "cohort_name": cohort_names.get(cohort_id, "Cohort 3 - Other Cohorts"),
        "cohort_id": cohort_id,
        "learner_journey": [
            {"stage": "Recruited", "count": data["recruited"]},
            {"stage": "Signed Up", "count": data["signed_up"]},
            {"stage": "Onboarded (Cyber-Safe)", "count": data["onboarded"]},
            {"stage": "Module 1", "count": data["module1"]},
            {"stage": "Module 2", "count": data["module2"]},
            {"stage": "Module 3 (In Progress)", "count": data["module3_in_progress"]}
        ],
        "sentiment_analysis": {
            "word_cloud": data["sentiment_words"],
            "sentiment_timeline": data["sentiment_timeline"]
        },
        "at_risk_learners": data["at_risk"],
        "content_engagement": data["content_engagement"],
        "weekly_performance": data["weekly_performance"],
        "engagement_heatmap": [
            {"day": "Monday", "morning": 78, "afternoon": 85, "evening": 65},
            {"day": "Tuesday", "morning": 82, "afternoon": 88, "evening": 70},
            {"day": "Wednesday", "morning": 80, "afternoon": 90, "evening": 68},
            {"day": "Thursday", "morning": 75, "afternoon": 82, "evening": 72},
            {"day": "Friday", "morning": 70, "afternoon": 75, "evening": 60},
            {"day": "Saturday", "morning": 45, "afternoon": 55, "evening": 50},
            {"day": "Sunday", "morning": 40, "afternoon": 48, "evening": 45}
        ],
        "trainer_interactions": [
            {"week": "Week 1", "emails": 25, "calls": 8, "messages": 42},
            {"week": "Week 2", "emails": 22, "calls": 6, "messages": 38},
            {"week": "Week 3", "emails": 28, "calls": 10, "messages": 45},
            {"week": "Week 4", "emails": 30, "calls": 12, "messages": 52},
            {"week": "Week 5", "emails": 45, "calls": 18, "messages": 68},
            {"week": "Week 6", "emails": 38, "calls": 15, "messages": 58},
            {"week": "Week 7", "emails": 32, "calls": 11, "messages": 48}
        ]
    }

@api_router.get("/dashboard/weekly-huddle")
async def get_weekly_huddle_data(current_user: User = Depends(get_current_user)):
    """Get weekly iteration huddle data (Screen #3)"""
    return {
        "week": 7,
        "date": "Week 7 - October 2025",
        "key_insight": {
            "title": "AI-Driven Insight (Week 7)",
            "description": "Our AI sentiment analysis shows a 30% spike in 'confusing' and 'stuck' keywords related to Module 2 (AI Queries). This directly correlates with the 5.4% learner drop-off at this stage."
        },
        "root_cause": {
            "title": "Hypothesis",
            "description": "The learner drop-off is not due to lack of interest, but due to a content difficulty barrier. The leap from Module 1 to Module 2 is too steep."
        },
        "recommendations": [
            {
                "id": 1,
                "category": "Content",
                "action": "Darevolution to co-design and add a new 'Explainer Video' to the start of Module 2.",
                "owner": "Darevolution",
                "due": "EOW"
            },
            {
                "id": 2,
                "category": "Support",
                "action": "DD Consulting to deploy a proactive, specialized AI chatbot to all learners currently 'At-Risk' in this module.",
                "owner": "DD Consulting",
                "due": "Immediate"
            }
        ],
        "decisions": [
            {"id": 1, "status": "Approved", "decision": "Action #1 (Darevolution) - Due EOW"},
            {"id": 2, "status": "Approved", "decision": "Action #2 (DD Consulting) - Deployed immediately"},
            {"id": 3, "status": "New Action", "decision": "FSO to review comms for new video"}
        ],
        "metrics": {
            "total_learners": 850,
            "active_learners": 765,
            "at_risk": 42,
            "completion_rate": 89
        }
    }

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()