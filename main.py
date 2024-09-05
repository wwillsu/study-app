import io
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import speech_recognition as sr
from pydub import AudioSegment
import openai
from decouple import config
from sqlalchemy.orm import Session
from database import get_db, Document

# Import necessary libraries and modules

app = FastAPI()
# Create a FastAPI application instance

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add CORS middleware to allow requests from the React frontend

openai.api_key = config('OPENAI_API_KEY')
# Set up the OpenAI API key from environment variables

async def process_file(file: UploadFile) -> str:
    content = await file.read()
    if file.filename.endswith('.pdf'):
        return process_pdf(content)
    elif file.filename.endswith(('.mp3', '.wav')):
        return process_audio(content, file.filename)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")
# Function to process uploaded files based on their type

def process_pdf(content: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text
# Function to extract text from PDF files

def process_audio(content: bytes, filename: str) -> str:
    audio = AudioSegment.from_file(io.BytesIO(content), format=filename.split('.')[-1])
    audio.export("temp.wav", format="wav")
    
    recognizer = sr.Recognizer()
    with sr.AudioFile("temp.wav") as source:
        audio_data = recognizer.record(source)
    
    text = recognizer.recognize_google(audio_data)
    return text
# Function to transcribe audio files to text

async def generate_notes_and_test(text: str):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates concise notes and practice tests."},
            {"role": "user", "content": f"Generate concise notes and a practice test based on the following text:\n\n{text}"}
        ]
    )
    return response.choices[0].message['content']
# Function to generate notes and practice tests using the ChatGPT API

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        processed_text = await process_file(file)
        generated_content = await generate_notes_and_test(processed_text)
        
        notes, practice_test = generated_content.split("Practice Test:", 1)
        
        db_document = Document(
            filename=file.filename,
            original_text=processed_text,
            processed_notes=notes.strip(),
            practice_test=practice_test.strip()
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return {"id": db_document.id, "filename": file.filename, "message": "File processed and stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# Endpoint to handle file uploads, process them, generate content, and store in the database

@app.get("/document/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": document.id,
        "filename": document.filename,
        "notes": document.processed_notes,
        "practice_test": document.practice_test
    }
# Endpoint to retrieve document details by ID