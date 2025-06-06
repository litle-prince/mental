from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import random


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


# Define Models
class Word(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    english: str
    russian: str
    category: str
    difficulty: int = Field(default=1, ge=1, le=3)  # 1=easy, 2=medium, 3=hard
    phonetic: Optional[str] = None
    example: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WordCreate(BaseModel):
    english: str
    russian: str
    category: str
    difficulty: int = Field(default=1, ge=1, le=3)
    phonetic: Optional[str] = None
    example: Optional[str] = None

class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    word_id: str
    user_id: str = Field(default="default_user")  # For MVP, single user
    correct_count: int = 0
    incorrect_count: int = 0
    last_studied: datetime = Field(default_factory=datetime.utcnow)
    mastery_level: int = 0  # 0=new, 1=learning, 2=familiar, 3=mastered

class StudySession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="default_user")
    session_type: str  # "flashcards" or "quiz"
    words_studied: int
    correct_answers: int
    incorrect_answers: int
    category: str
    duration_seconds: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizAnswer(BaseModel):
    word_id: str
    user_answer: str
    is_correct: bool

# Initialize database with sample words
async def init_database():
    """Initialize database with sample vocabulary"""
    words_count = await db.words.count_documents({})
    if words_count == 0:
        sample_words = [
            # Family & People
            {"english": "family", "russian": "семья", "category": "family", "difficulty": 1, "phonetic": "/ˈfæməli/", "example": "I love my family."},
            {"english": "mother", "russian": "мать", "category": "family", "difficulty": 1, "phonetic": "/ˈmʌðər/", "example": "My mother is kind."},
            {"english": "father", "russian": "отец", "category": "family", "difficulty": 1, "phonetic": "/ˈfɑːðər/", "example": "My father works hard."},
            {"english": "children", "russian": "дети", "category": "family", "difficulty": 1, "phonetic": "/ˈtʃɪldrən/", "example": "The children are playing."},
            {"english": "friend", "russian": "друг", "category": "family", "difficulty": 1, "phonetic": "/frend/", "example": "She is my best friend."},
            
            # Food & Cooking
            {"english": "food", "russian": "еда", "category": "food", "difficulty": 1, "phonetic": "/fuːd/", "example": "I like healthy food."},
            {"english": "breakfast", "russian": "завтрак", "category": "food", "difficulty": 1, "phonetic": "/ˈbrekfəst/", "example": "I eat breakfast every morning."},
            {"english": "dinner", "russian": "ужин", "category": "food", "difficulty": 1, "phonetic": "/ˈdɪnər/", "example": "We have dinner at 7 PM."},
            {"english": "vegetable", "russian": "овощ", "category": "food", "difficulty": 2, "phonetic": "/ˈvedʒtəbəl/", "example": "Carrots are vegetables."},
            {"english": "restaurant", "russian": "ресторан", "category": "food", "difficulty": 2, "phonetic": "/ˈrestərɑːnt/", "example": "Let's go to a restaurant."},
            
            # Travel & Places
            {"english": "travel", "russian": "путешествовать", "category": "travel", "difficulty": 2, "phonetic": "/ˈtrævəl/", "example": "I love to travel."},
            {"english": "hotel", "russian": "отель", "category": "travel", "difficulty": 1, "phonetic": "/hoʊˈtel/", "example": "We stayed at a nice hotel."},
            {"english": "airport", "russian": "аэропорт", "category": "travel", "difficulty": 2, "phonetic": "/ˈerpɔːrt/", "example": "The airplane is at the airport."},
            {"english": "vacation", "russian": "отпуск", "category": "travel", "difficulty": 2, "phonetic": "/veɪˈkeɪʃən/", "example": "I'm going on vacation next week."},
            {"english": "destination", "russian": "место назначения", "category": "travel", "difficulty": 3, "phonetic": "/ˌdestɪˈneɪʃən/", "example": "Paris is my favorite destination."},
            
            # Work & Business
            {"english": "work", "russian": "работа", "category": "work", "difficulty": 1, "phonetic": "/wɜːrk/", "example": "I go to work every day."},
            {"english": "job", "russian": "работа", "category": "work", "difficulty": 1, "phonetic": "/dʒɑːb/", "example": "I have a good job."},
            {"english": "office", "russian": "офис", "category": "work", "difficulty": 1, "phonetic": "/ˈɔːfɪs/", "example": "My office is downtown."},
            {"english": "meeting", "russian": "встреча", "category": "work", "difficulty": 2, "phonetic": "/ˈmiːtɪŋ/", "example": "We have a meeting at 2 PM."},
            {"english": "salary", "russian": "зарплата", "category": "work", "difficulty": 2, "phonetic": "/ˈsæləri/", "example": "I'm happy with my salary."},
            
            # Basic Vocabulary
            {"english": "hello", "russian": "привет", "category": "basic", "difficulty": 1, "phonetic": "/həˈloʊ/", "example": "Hello, how are you?"},
            {"english": "goodbye", "russian": "до свидания", "category": "basic", "difficulty": 1, "phonetic": "/ɡʊdˈbaɪ/", "example": "Goodbye, see you tomorrow!"},
            {"english": "please", "russian": "пожалуйста", "category": "basic", "difficulty": 1, "phonetic": "/pliːz/", "example": "Can you help me, please?"},
            {"english": "thank you", "russian": "спасибо", "category": "basic", "difficulty": 1, "phonetic": "/θæŋk juː/", "example": "Thank you for your help."},
            {"english": "beautiful", "russian": "красивый", "category": "basic", "difficulty": 2, "phonetic": "/ˈbjuːtɪfəl/", "example": "The sunset is beautiful."},
            {"english": "important", "russian": "важный", "category": "basic", "difficulty": 2, "phonetic": "/ɪmˈpɔːrtənt/", "example": "This is very important."},
            {"english": "understand", "russian": "понимать", "category": "basic", "difficulty": 2, "phonetic": "/ˌʌndərˈstænd/", "example": "Do you understand me?"},
            {"english": "knowledge", "russian": "знание", "category": "basic", "difficulty": 3, "phonetic": "/ˈnɑːlɪdʒ/", "example": "Knowledge is power."},
        ]
        
        # Convert to Word objects and insert
        word_objects = [Word(**word_data) for word_data in sample_words]
        word_dicts = [word.dict() for word in word_objects]
        await db.words.insert_many(word_dicts)
        print(f"Initialized database with {len(word_dicts)} words")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "English Learning App API"}

# Words endpoints
@api_router.get("/words", response_model=List[Word])
async def get_words(category: Optional[str] = None, difficulty: Optional[int] = None):
    """Get words with optional filtering by category and difficulty"""
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    if difficulty:
        filter_dict["difficulty"] = difficulty
    
    words = await db.words.find(filter_dict).to_list(1000)
    return [Word(**word) for word in words]

@api_router.get("/words/categories")
async def get_categories():
    """Get all available word categories"""
    categories = await db.words.distinct("category")
    return {"categories": categories}

@api_router.get("/words/random")
async def get_random_words(category: Optional[str] = None, count: int = 10):
    """Get random words for studying"""
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    
    # Get words and select random subset
    words = await db.words.find(filter_dict).to_list(1000)
    if len(words) > count:
        words = random.sample(words, count)
    
    return [Word(**word) for word in words]

@api_router.post("/words", response_model=Word)
async def create_word(word_data: WordCreate):
    """Create a new word"""
    word = Word(**word_data.dict())
    await db.words.insert_one(word.dict())
    return word

# Quiz endpoints
@api_router.get("/quiz/multiple-choice")
async def get_multiple_choice_quiz(category: Optional[str] = None, count: int = 5):
    """Generate multiple choice quiz"""
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    
    words = await db.words.find(filter_dict).to_list(1000)
    if len(words) < count:
        raise HTTPException(status_code=400, detail="Not enough words for quiz")
    
    quiz_words = random.sample(words, count)
    all_words = words  # For generating wrong answers
    
    quiz_questions = []
    for word in quiz_words:
        # Generate 3 wrong answers
        wrong_answers = random.sample([w for w in all_words if w["id"] != word["id"]], 3)
        
        options = [
            {"text": word["russian"], "correct": True},
            {"text": wrong_answers[0]["russian"], "correct": False},
            {"text": wrong_answers[1]["russian"], "correct": False},
            {"text": wrong_answers[2]["russian"], "correct": False}
        ]
        random.shuffle(options)
        
        quiz_questions.append({
            "id": word["id"],
            "english": word["english"],
            "phonetic": word.get("phonetic"),
            "options": options
        })
    
    return {"questions": quiz_questions}

# Progress tracking
@api_router.post("/progress/update")
async def update_progress(word_id: str, is_correct: bool, user_id: str = "default_user"):
    """Update user progress for a word"""
    # Find existing progress or create new
    progress = await db.progress.find_one({"word_id": word_id, "user_id": user_id})
    
    if progress:
        if is_correct:
            progress["correct_count"] += 1
        else:
            progress["incorrect_count"] += 1
        
        # Update mastery level based on performance
        total_attempts = progress["correct_count"] + progress["incorrect_count"]
        accuracy = progress["correct_count"] / total_attempts if total_attempts > 0 else 0
        
        if total_attempts >= 3:
            if accuracy >= 0.8:
                progress["mastery_level"] = 3  # Mastered
            elif accuracy >= 0.6:
                progress["mastery_level"] = 2  # Familiar
            else:
                progress["mastery_level"] = 1  # Learning
        else:
            progress["mastery_level"] = 1  # Learning
        
        progress["last_studied"] = datetime.utcnow()
        await db.progress.replace_one({"_id": progress["_id"]}, progress)
    else:
        progress_obj = UserProgress(
            word_id=word_id,
            user_id=user_id,
            correct_count=1 if is_correct else 0,
            incorrect_count=0 if is_correct else 1,
            mastery_level=1
        )
        await db.progress.insert_one(progress_obj.dict())
        progress = progress_obj.dict()
    
    return {"progress": progress}

@api_router.get("/progress/stats")
async def get_progress_stats(user_id: str = "default_user"):
    """Get user progress statistics"""
    progress_data = await db.progress.find({"user_id": user_id}).to_list(1000)
    sessions = await db.sessions.find({"user_id": user_id}).to_list(1000)
    
    total_words = len(progress_data)
    mastered_words = len([p for p in progress_data if p["mastery_level"] == 3])
    familiar_words = len([p for p in progress_data if p["mastery_level"] == 2])
    learning_words = len([p for p in progress_data if p["mastery_level"] == 1])
    
    total_correct = sum(p["correct_count"] for p in progress_data)
    total_incorrect = sum(p["incorrect_count"] for p in progress_data)
    accuracy = total_correct / (total_correct + total_incorrect) if (total_correct + total_incorrect) > 0 else 0
    
    return {
        "total_words_studied": total_words,
        "mastered_words": mastered_words,
        "familiar_words": familiar_words,
        "learning_words": learning_words,
        "accuracy": round(accuracy * 100, 1),
        "total_sessions": len(sessions),
        "total_correct": total_correct,
        "total_incorrect": total_incorrect
    }

# Study session tracking
@api_router.post("/sessions", response_model=StudySession)
async def create_study_session(session_data: StudySession):
    """Create a new study session record"""
    await db.sessions.insert_one(session_data.dict())
    return session_data

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
