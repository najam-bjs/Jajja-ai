import os
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag.rag_service import RAGService
from rag.database import create_user, verify_user
from rag.auth import create_access_token, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
rag = RAGService()

class QuestionRequest(BaseModel):
    question: str

class RegisterRequest(BaseModel):
    u_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def home():
    return {"message": "JajjaAI RAG Engine Active"}

@app.post("/register")
async def register(request: RegisterRequest):
    try:
        user_id = create_user(request.u_name, request.email, request.password)
        return {"success": True, "message": "Registration successful", "user_id": user_id}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/login")
async def login(request: LoginRequest):
    user = verify_user(request.email, request.password)
    if user is None:
        return {"success": False, "message": "Invalid email or password"}

    token = create_access_token({"user_id": user[0], "email": user[2]})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user[0], "name": user[1], "email": user[2]}
    }

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        info = rag.load_document(file_path)
        return {
            "message": "PDF loaded successfully",
            "filename": file.filename,
            "pages": info["pages"],
            "chunks": info["chunks"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(
    request: QuestionRequest,
    user=Depends(get_current_user)
):
    try:
        result = rag.ask(request.question)
        return {
            "answer": result["answer"],
            "sources": result["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))