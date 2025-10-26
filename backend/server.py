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

class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_token: str
    user_id: str
    expires_at: datetime

# ============= AUTH ENDPOINTS =============
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
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"success": True}

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
    
    cohort_data = {
        1: {
            "recruited": 150,
            "signed_up": 148,
            "onboarded": 145,
            "module1": 142,
            "module2": 138,
            "module3_in_progress": 135
        },
        2: {
            "recruited": 100,
            "signed_up": 99,
            "onboarded": 97,
            "module1": 95,
            "module2": 92,
            "module3_in_progress": 90
        },
        3: {
            "recruited": 600,
            "signed_up": 598,
            "onboarded": 590,
            "module1": 580,
            "module2": 550,
            "module3_in_progress": 540
        }
    }
    
    data = cohort_data.get(cohort_id, cohort_data[3])
    
    return {
        "cohort_name": cohort_names.get(cohort_id, "Cohort 3 - Other Cohorts"),
        "learner_journey": [
            {"stage": "Recruited", "count": data["recruited"]},
            {"stage": "Signed Up", "count": data["signed_up"]},
            {"stage": "Onboarded (Cyber-Safe)", "count": data["onboarded"]},
            {"stage": "Module 1", "count": data["module1"]},
            {"stage": "Module 2", "count": data["module2"]},
            {"stage": "Module 3 (In Progress)", "count": data["module3_in_progress"]}
        ],
        "sentiment_analysis": {
            "word_cloud": [
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
            ]
        },
        "at_risk_learners": [
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