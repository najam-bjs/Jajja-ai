from sentence_transformers import SentenceTransformer


model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings(chunks):
    texts = [chunk["text"] for chunk in chunks]

    embeddings = model.encode(texts)

    return embeddings

if __name__ == "__main__":
    from rag.pdf_loader import load_pdf
    from rag.chunker import create_chunks

    pdf_path = "uploads/check.pdf"

    pages = load_pdf(pdf_path)
    chunks = create_chunks(pages)

    embeddings = create_embeddings(chunks)

    print("Total chunks:", len(chunks))
    print("Embedding shape:", embeddings.shape)

    print("\nFirst embedding:")
    print(embeddings[0])