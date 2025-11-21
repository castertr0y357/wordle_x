from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid


# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    display_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserInDB(User):
    hashed_password: str


class UserStats(BaseModel):
    games_played: int = 0
    games_won: int = 0
    current_streak: int = 0
    highest_streak: int = 0
    avg_guesses_by_length: Dict[str, float] = Field(default_factory=lambda: {"5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0})
    total_guesses_by_length: Dict[str, int] = Field(default_factory=lambda: {"5": 0, "6": 0, "7": 0, "8": 0})
    games_by_length: Dict[str, int] = Field(default_factory=lambda: {"5": 0, "6": 0, "7": 0, "8": 0})


class UserProfile(BaseModel):
    user: User
    stats: UserStats


class UpdateDisplayName(BaseModel):
    display_name: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


# Game Session Models
class GameSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    word_length: int
    solution: str
    guesses: List[str] = Field(default_factory=list)
    current_guess: str = ""
    game_status: str = "playing"  # playing, won, lost
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GameSessionCreate(BaseModel):
    word_length: int
    solution: str
    guesses: List[str] = Field(default_factory=list)
    current_guess: str = ""
    game_status: str = "playing"


class GameSessionUpdate(BaseModel):
    guesses: List[str]
    current_guess: str
    game_status: str


class GameComplete(BaseModel):
    word_length: int
    won: bool
    num_guesses: int


# Preferences Models
class UserPreferences(BaseModel):
    user_id: str
    preferred_word_lengths: List[int] = Field(default_factory=lambda: [5])


class UpdatePreferences(BaseModel):
    preferred_word_lengths: List[int]
