from rag.pdf_loader import load_pdf
from rag.chunker import create_chunks
from rag.embeddings import create_embeddings, model
from rag.vector_store import create_index
from rag.generator import generate_answer

class RAGService:
    def __init__(self):
        self.chunks = []
        self.embeddings = None
        self.index = None

    def load_document(self, pdf_path):
        pages = load_pdf(pdf_path)

        if not pages:
            raise ValueError("PDF is empty or unreadable.")

        self.chunks = create_chunks(pages)

        if not self.chunks:
            raise ValueError("No text extracted from the PDF.")

        self.embeddings = create_embeddings(self.chunks)
        self.index = create_index(self.embeddings)

        return {
            "pages": len(pages),
            "chunks": len(self.chunks)
        }

    def ask(self, question, top_k=4):
        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        q = question.lower().strip()

        # Conversational shortcuts
        greetings = {
            "hi": "Hello! 👋 I'm JajjaAI. Ask me anything about your uploaded PDF.",
            "hello": "Hello! 👋 How can I help you with your document today?",
            "hey": "Hey there! Ready to assist with your PDF.",
            "how are you": "I'm doing great! 😄 Ready to help you analyze your document.",
            "thanks": "You're welcome! 😊 Let me know if you have more questions.",
            "thank you": "You're welcome! 😊",
            "bye": "Goodbye! 👋 Have a great day!"
        }

        if q in greetings:
            return {"answer": greetings[q], "sources": []}

        if self.index is None or not self.chunks:
            return {
                "answer": "Please upload a PDF first.",
                "sources": []
            }

        # Embed question & perform vector search
        q_embedding = model.encode([question], normalize_embeddings=True).astype("float32")
        distances, indices = self.index.search(q_embedding, top_k)

        results = []
        for score, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            results.append({
                "text": self.chunks[idx]["text"],
                "page": self.chunks[idx]["page"],
                "score": float(score)
            })

        if not results:
            return {
                "answer": "The answer was not found in the provided document.",
                "sources": []
            }

        answer = generate_answer(question, results)

        # Unique page numbers sorted ascending
        sources = sorted(list({r["page"] for r in results}))

        return {
            "answer": answer,
            "sources": sources
        }