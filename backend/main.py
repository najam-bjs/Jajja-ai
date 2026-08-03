from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from rag.rag_service import RAGService



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGService()


@app.get("/")
def home():
    return {"message": "RAG API is running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    info = rag.load_document(file_path)

    return {
        "message": "PDF loaded successfully",
        "filename": file.filename,
        "pages": info["pages"],
        "chunks": info["chunks"]
    }


class QuestionRequest(BaseModel):
    question: str


@app.post("/ask")
async def ask_question(request: QuestionRequest):

    result = rag.ask(request.question)

    return {
        "answer": result["answer"],
        "sources": result["sources"]
    }