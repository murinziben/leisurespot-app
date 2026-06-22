"""Drop all tables and recreate from SQLAlchemy models."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from shared.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://leisurespot:strongpassword@127.0.0.1:5433/leisurespot_db")
engine = create_engine(DATABASE_URL)

print("Dropping all tables (CASCADE)…")
with engine.begin() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE"))
    conn.execute(text("CREATE SCHEMA public"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO leisurespot"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO public"))

print("Recreating tables from SQLAlchemy models…")
Base.metadata.create_all(bind=engine)
print("✅ Done.")
