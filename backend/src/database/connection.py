# SQLite engine + session factory
# Placeholder for Sprint 3

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///./motu.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
