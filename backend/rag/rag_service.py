from rag.pdf_loader import load_pdf
from rag.chunker import create_chunks
from rag.embeddings import create_embeddings
from rag.vector_store import create_index
from rag.embeddings import model
from rag.generator import generate_answer


class RAGService:

    def __init__(self):
        self.chunks = []
        self.embeddings = None
        self.index = None

    def load_document(self, pdf_path):
        pages = load_pdf(pdf_path)

        if not pages:
            raise ValueError("PDF is empty.")

        self.chunks = create_chunks(pages)

        if not self.chunks:
            raise ValueError("No text could be extracted from the PDF.")

        self.embeddings = create_embeddings(self.chunks)

        self.index = create_index(self.embeddings)

        return {
            "pages": len(pages),
            "chunks": len(self.chunks)
        }

    def ask(self, question, top_k=3):

        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        q = question.lower().strip()

        # Simple greetings (no PDF search)
        if q in ["hi", "hello", "hey"]:
            return {
                "answer": "Hello! 👋 I'm Jajja. Upload a PDF & ask me a question about your document.",
                "sources": []
            }

        if q in ["how are you", "how are you?"]:
            return {
                "answer": "I'm doing great! 😄 Ready to help you with your PDF.",
                "sources": []
            }

        if q in ["thanks", "thank you", "thanks!", "thank you!"]:
            return {
                "answer": "You're welcome! 😊",
                "sources": []
            }

        if q in ["bye", "goodbye"]:
            return {
                "answer": "Goodbye! 👋 Have a great day!",
                "sources": []
            }

        # PDF must be loaded for document questions
        if self.index is None:
            return {
                "answer": "Please upload a PDF first.",
                "sources": []
            }

        # Convert question to embedding
        question_embedding = model.encode([question]).astype("float32")

        # Search top chunks
        distances, indices = self.index.search(question_embedding, top_k)

        results = []

        for distance, index_number in zip(distances[0], indices[0]):

            if index_number == -1:
                continue

            results.append({
                "text": self.chunks[index_number]["text"],
                "page": self.chunks[index_number]["page"],
                "score": float(distance)
            })

        if not results:
            return {
                "answer": "The answer was not found in the provided document.",
                "sources": []
            }

        # Generate answer
        answer = generate_answer(question, results)

        return {
            "answer": answer,
            "sources": list(dict.fromkeys([r["page"] for r in results]))
        }


if __name__ == "__main__":

    rag = RAGService()

    info = rag.load_document("uploads/check.pdf")

    print("PDF loaded!")
    print("Pages:", info["pages"])
    print("Chunks:", info["chunks"])

    while True:

        question = input("\nAsk a question (type 'exit' to quit): ")

        if question.lower() == "exit":
            break

        result = rag.ask(question)

        print("\nAnswer:")
        print(result["answer"])

        print("\nSources:")

        for page in result["sources"]:
            print(f"Page {page}")