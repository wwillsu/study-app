from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config

SQLALCHEMY_DATABASE_URL = config('DATABASE_URL')
# Get the database URL from environment variables

engine = create_engine(SQLALCHEMY_DATABASE_URL)
# Create a SQLAlchemy engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Create a SessionLocal class for database sessions

Base = declarative_base()
# Create a Base class for declarative models

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_text = Column(Text)
    processed_notes = Column(Text)
    practice_test = Column(Text)
# Define the Document model for the database

Base.metadata.create_all(bind=engine)
# Create the database tables

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Function to get a database session