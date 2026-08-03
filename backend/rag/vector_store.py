import faiss
import numpy as np


def create_index(embeddings):
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    vectors = np.array(embeddings).astype("float32")

    index.add(vectors)

    return index

if __name__ == "__main__":
    from rag.pdf_loader import load_pdf
    from rag.chunker import create_chunks
    from rag.embeddings import create_embeddings

    pdf_path = "uploads/check.pdf"

    pages = load_pdf(pdf_path)
    chunks = create_chunks(pages)

    embeddings = create_embeddings(chunks)

    index = create_index(embeddings)

    print("Total chunks:", len(chunks))
    print("FAISS vectors:", index.ntotal)