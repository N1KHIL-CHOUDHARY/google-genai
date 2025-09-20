# backend/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.services.document_processor import process_document
from app.services.summarizer import summarize_document
from app.services.qa_engine import chat_with_documents
from pydantic import BaseModel, EmailStr
from app.services.firestore_manager import (
    save_user, 
    save_document_summary,
    get_documents_by_user_id,
    get_user_by_email
)

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str



app = FastAPI(
    title="Legal Document Assistant API",
    description="AI-powered legal document analysis and Q&A system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Legal Document Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/documents/user/{user_id}")
async def get_user_documents(user_id: str):
    docs = get_documents_by_user_id(user_id)
    return {"documents": docs}

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    print("Received user_id:", user_id)
    print("Received file:", getattr(file, 'filename', None))
    try:
        doc_id, meta = await process_document(file)
        summary = await summarize_document(doc_id)
        save_document_summary(user_id, doc_id, meta.get("filename", ""), summary)
        return {"doc_id": doc_id, "meta": meta, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/analysis/{documentId}")
async def get_analysis(documentId: str):
    try:
        summary = await summarize_document(documentId)
        return JSONResponse(content=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/user")
async def chat_user(user_id: str = Body(...), query: str = Body(...)):
    docs = get_documents_by_user_id(user_id)
    doc_ids = [d["doc_id"] for d in docs if d.get("doc_id")]
    try:
        response = await chat_with_documents(doc_ids, query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    
@app.post("/auth/register")
async def register(user: RegisterUser):
    # Check if a user with this email already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    try:
        # The save_user function should handle password hashing internally
        user_id = save_user(user.name, user.email, user.password)
        return {"message": "User registered successfully", "user": {"id": user_id, "name": user.name, "email": user.email}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during registration: {e}")

@app.post("/auth/login")
async def login(email: str = Body(...), password: str = Body(...)):
    # Import the new verify_password function
    from app.services.firestore_manager import verify_password

    user = get_user_by_email(email)
    
    # Securely check the password hash instead of plain text
    if not user or not verify_password(password, user.get("password")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {"message": "Login successful", "user": {"id": user.get("id"), "name": user.get("name"), "email": user.get("email")}}