from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import (
    UserCreate, UserLogin, User, UserInDB, UserProfile, UserStats,
    UpdateDisplayName, ChangePassword, AuthResponse,
    GameSession, GameSessionCreate, GameSessionUpdate, GameComplete,
    UserPreferences, UpdatePreferences
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user_id, get_current_user_id_optional
)
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

auth_router = APIRouter(prefix="/auth", tags=["auth"])
profile_router = APIRouter(prefix="/profile", tags=["profile"])
game_router = APIRouter(prefix="/game", tags=["game"])
preferences_router = APIRouter(prefix="/preferences", tags=["preferences"])


# Helper function to get database (will be set up in main server.py)
def get_db():
    from server import db
    return db


# Auth Routes
@auth_router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserCreate):
    db = get_db()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if display name is taken
    if user_data.display_name:
        existing_display_name = await db.users.find_one({"display_name": user_data.display_name})
        if existing_display_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Display name already taken"
            )
    
    # Create user
    user_dict = {
        "id": str(uuid4()),
        "email": user_data.email.lower(),
        "display_name": user_data.display_name or user_data.email.split("@")[0],
        "hashed_password": get_password_hash(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    
    # Initialize user stats
    stats_dict = {
        "user_id": user_dict["id"],
        "games_played": 0,
        "games_won": 0,
        "current_streak": 0,
        "highest_streak": 0,
        "avg_guesses_by_length": {"5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0},
        "total_guesses_by_length": {"5": 0, "6": 0, "7": 0, "8": 0},
        "games_by_length": {"5": 0, "6": 0, "7": 0, "8": 0}
    }
    await db.user_stats.insert_one(stats_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_dict["id"]})
    
    # Return user without password
    user = User(
        id=user_dict["id"],
        email=user_dict["email"],
        display_name=user_dict["display_name"],
        created_at=datetime.fromisoformat(user_dict["created_at"])
    )
    
    return AuthResponse(access_token=access_token, user=user)


@auth_router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    db = get_db()
    
    # Find user
    user_dict = await db.users.find_one({"email": credentials.email.lower()})
    if not user_dict or not verify_password(credentials.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_dict["id"]})
    
    # Return user without password
    user = User(
        id=user_dict["id"],
        email=user_dict["email"],
        display_name=user_dict.get("display_name"),
        created_at=datetime.fromisoformat(user_dict["created_at"]) if isinstance(user_dict["created_at"], str) else user_dict["created_at"]
    )
    
    return AuthResponse(access_token=access_token, user=user)


@auth_router.get("/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    user_dict = await db.users.find_one({"id": user_id})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        display_name=user_dict.get("display_name"),
        created_at=datetime.fromisoformat(user_dict["created_at"]) if isinstance(user_dict["created_at"], str) else user_dict["created_at"]
    )


# Profile Routes
@profile_router.get("", response_model=UserProfile)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Get user
    user_dict = await db.users.find_one({"id": user_id})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = User(
        id=user_dict["id"],
        email=user_dict["email"],
        display_name=user_dict.get("display_name"),
        created_at=datetime.fromisoformat(user_dict["created_at"]) if isinstance(user_dict["created_at"], str) else user_dict["created_at"]
    )
    
    # Get stats
    stats_dict = await db.user_stats.find_one({"user_id": user_id})
    if not stats_dict:
        # Create default stats if not found
        stats = UserStats()
    else:
        stats = UserStats(**stats_dict)
    
    return UserProfile(user=user, stats=stats)


@profile_router.put("/display-name", response_model=User)
async def update_display_name(data: UpdateDisplayName, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Check if display name is taken by another user
    existing_user = await db.users.find_one({"display_name": data.display_name})
    if existing_user and existing_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Display name already taken"
        )

    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"display_name": data.display_name}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict = await db.users.find_one({"id": user_id})
    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        display_name=user_dict.get("display_name"),
        created_at=datetime.fromisoformat(user_dict["created_at"]) if isinstance(user_dict["created_at"], str) else user_dict["created_at"]
    )


@profile_router.put("/password")
async def change_password(data: ChangePassword, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Get user
    user_dict = await db.users.find_one({"id": user_id})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(data.current_password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    new_hashed_password = get_password_hash(data.new_password)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    return {"message": "Password updated successfully"}


# Game Routes
@game_router.get("/session", response_model=Optional[GameSession])
async def get_game_session(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Get the most recent active game session
    session_dict = await db.game_sessions.find_one(
        {"user_id": user_id},
        sort=[("updated_at", -1)]
    )
    
    if not session_dict:
        return None
    
    return GameSession(
        id=session_dict["id"],
        user_id=session_dict["user_id"],
        word_length=session_dict["word_length"],
        solution=session_dict["solution"],
        guesses=session_dict.get("guesses", []),
        current_guess=session_dict.get("current_guess", ""),
        game_status=session_dict["game_status"],
        created_at=datetime.fromisoformat(session_dict["created_at"]) if isinstance(session_dict["created_at"], str) else session_dict["created_at"],
        updated_at=datetime.fromisoformat(session_dict["updated_at"]) if isinstance(session_dict["updated_at"], str) else session_dict["updated_at"]
    )


@game_router.post("/session", response_model=GameSession)
async def save_game_session(session_data: GameSessionCreate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Check if there's an existing active session
    existing_session = await db.game_sessions.find_one(
        {"user_id": user_id, "game_status": "playing"}
    )
    
    if existing_session:
        # Update existing session
        await db.game_sessions.update_one(
            {"id": existing_session["id"]},
            {
                "$set": {
                    "word_length": session_data.word_length,
                    "solution": session_data.solution,
                    "guesses": session_data.guesses,
                    "current_guess": session_data.current_guess,
                    "game_status": session_data.game_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        session_id = existing_session["id"]
    else:
        # Create new session
        session_dict = {
            "id": str(uuid4()),
            "user_id": user_id,
            "word_length": session_data.word_length,
            "solution": session_data.solution,
            "guesses": session_data.guesses,
            "current_guess": session_data.current_guess,
            "game_status": session_data.game_status,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.game_sessions.insert_one(session_dict)
        session_id = session_dict["id"]
    
    # Fetch and return the session
    session_dict = await db.game_sessions.find_one({"id": session_id})
    return GameSession(
        id=session_dict["id"],
        user_id=session_dict["user_id"],
        word_length=session_dict["word_length"],
        solution=session_dict["solution"],
        guesses=session_dict.get("guesses", []),
        current_guess=session_dict.get("current_guess", ""),
        game_status=session_dict["game_status"],
        created_at=datetime.fromisoformat(session_dict["created_at"]) if isinstance(session_dict["created_at"], str) else session_dict["created_at"],
        updated_at=datetime.fromisoformat(session_dict["updated_at"]) if isinstance(session_dict["updated_at"], str) else session_dict["updated_at"]
    )


@game_router.put("/session", response_model=GameSession)
async def update_game_session(session_data: GameSessionUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Find the active session
    session_dict = await db.game_sessions.find_one(
        {"user_id": user_id, "game_status": "playing"}
    )
    
    if not session_dict:
        raise HTTPException(status_code=404, detail="No active game session found")
    
    # Update session
    await db.game_sessions.update_one(
        {"id": session_dict["id"]},
        {
            "$set": {
                "guesses": session_data.guesses,
                "current_guess": session_data.current_guess,
                "game_status": session_data.game_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Fetch and return updated session
    session_dict = await db.game_sessions.find_one({"id": session_dict["id"]})
    return GameSession(
        id=session_dict["id"],
        user_id=session_dict["user_id"],
        word_length=session_dict["word_length"],
        solution=session_dict["solution"],
        guesses=session_dict.get("guesses", []),
        current_guess=session_dict.get("current_guess", ""),
        game_status=session_dict["game_status"],
        created_at=datetime.fromisoformat(session_dict["created_at"]) if isinstance(session_dict["created_at"], str) else session_dict["created_at"],
        updated_at=datetime.fromisoformat(session_dict["updated_at"]) if isinstance(session_dict["updated_at"], str) else session_dict["updated_at"]
    )


@game_router.post("/complete")
async def complete_game(game_data: GameComplete, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    
    # Update user stats
    stats_dict = await db.user_stats.find_one({"user_id": user_id})
    
    if not stats_dict:
        # Create default stats
        stats_dict = {
            "user_id": user_id,
            "games_played": 0,
            "games_won": 0,
            "current_streak": 0,
            "highest_streak": 0,
            "avg_guesses_by_length": {"5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0},
            "total_guesses_by_length": {"5": 0, "6": 0, "7": 0, "8": 0},
            "games_by_length": {"5": 0, "6": 0, "7": 0, "8": 0}
        }
    
    # Update statistics
    stats_dict["games_played"] = stats_dict.get("games_played", 0) + 1
    
    if game_data.won:
        stats_dict["games_won"] = stats_dict.get("games_won", 0) + 1
        stats_dict["current_streak"] = stats_dict.get("current_streak", 0) + 1
        stats_dict["highest_streak"] = max(stats_dict.get("highest_streak", 0), stats_dict["current_streak"])
    else:
        stats_dict["current_streak"] = 0
    
    # Update guesses by length
    length_key = str(game_data.word_length)
    if "total_guesses_by_length" not in stats_dict:
        stats_dict["total_guesses_by_length"] = {"5": 0, "6": 0, "7": 0, "8": 0}
    if "games_by_length" not in stats_dict:
        stats_dict["games_by_length"] = {"5": 0, "6": 0, "7": 0, "8": 0}
    if "avg_guesses_by_length" not in stats_dict:
        stats_dict["avg_guesses_by_length"] = {"5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0}
    
    stats_dict["total_guesses_by_length"][length_key] = stats_dict["total_guesses_by_length"].get(length_key, 0) + game_data.num_guesses
    stats_dict["games_by_length"][length_key] = stats_dict["games_by_length"].get(length_key, 0) + 1
    
    # Calculate average
    if stats_dict["games_by_length"][length_key] > 0:
        stats_dict["avg_guesses_by_length"][length_key] = round(
            stats_dict["total_guesses_by_length"][length_key] / stats_dict["games_by_length"][length_key],
            2
        )
    
    # Upsert stats
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": stats_dict},
        upsert=True
    )
    
    return {"message": "Game completed successfully", "stats": stats_dict}


@game_router.post("/abandon")
async def abandon_game(user_id: str = Depends(get_current_user_id)):
    """Called when user starts a new game while one is in progress"""
    db = get_db()
    
    # Get current active session
    session_dict = await db.game_sessions.find_one(
        {"user_id": user_id, "game_status": "playing"}
    )
    
    if session_dict and len(session_dict.get("guesses", [])) > 0:
        # Only count as abandoned if they had made at least one guess
        # Update user stats
        stats_dict = await db.user_stats.find_one({"user_id": user_id})
        
        if not stats_dict:
            # Create default stats
            stats_dict = {
                "user_id": user_id,
                "games_played": 0,
                "games_won": 0,
                "current_streak": 0,
                "highest_streak": 0,
                "avg_guesses_by_length": {"5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0},
                "total_guesses_by_length": {"5": 0, "6": 0, "7": 0, "8": 0},
                "games_by_length": {"5": 0, "6": 0, "7": 0, "8": 0}
            }
        
        # Increment games played and reset streak (like a loss)
        stats_dict["games_played"] = stats_dict.get("games_played", 0) + 1
        stats_dict["current_streak"] = 0
        
        # Upsert stats
        await db.user_stats.update_one(
            {"user_id": user_id},
            {"$set": stats_dict},
            upsert=True
        )
        
        # Mark the session as abandoned
        await db.game_sessions.update_one(
            {"id": session_dict["id"]},
            {"$set": {"game_status": "abandoned"}}
        )
        
        return {"message": "Game abandoned", "stats": stats_dict}
    
    return {"message": "No active game to abandon"}


# Preferences Routes
@preferences_router.get("", response_model=UserPreferences)
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    """Get user preferences"""
    db = get_db()
    
    prefs_dict = await db.user_preferences.find_one({"user_id": user_id})
    
    if not prefs_dict:
        # Return default preferences
        return UserPreferences(
            user_id=user_id,
            preferred_word_lengths=[5]
        )
    
    return UserPreferences(
        user_id=prefs_dict["user_id"],
        preferred_word_lengths=prefs_dict.get("preferred_word_lengths", [5])
    )


@preferences_router.put("", response_model=UserPreferences)
async def update_preferences(
    preferences: UpdatePreferences,
    user_id: str = Depends(get_current_user_id)
):
    """Update user preferences"""
    db = get_db()
    
    # Validate word lengths
    valid_lengths = {5, 6, 7, 8}
    if not all(length in valid_lengths for length in preferences.preferred_word_lengths):
        raise HTTPException(
            status_code=400,
            detail="Invalid word lengths. Must be 5, 6, 7, or 8."
        )
    
    if len(preferences.preferred_word_lengths) == 0:
        raise HTTPException(
            status_code=400,
            detail="Must select at least one word length."
        )
    
    # Upsert preferences
    await db.user_preferences.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "preferred_word_lengths": preferences.preferred_word_lengths
            }
        },
        upsert=True
    )
    
    return UserPreferences(
        user_id=user_id,
        preferred_word_lengths=preferences.preferred_word_lengths
    )
