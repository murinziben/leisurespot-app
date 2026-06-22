"""Create all database tables directly (alternative to alembic upgrade head for first run)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from shared.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://leisurespot:strongpassword@127.0.0.1:5433/leisurespot_db")
engine = create_engine(DATABASE_URL)

print("Creating all tables…")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully.")
