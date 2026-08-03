from rag.embeddings import model
from rag.vector_store import create_index


def retrieve_chunks(question, chunks, embeddings, top_k=3):
    index = create_index(embeddings)

    question_embedding = model.encode([question])

    distances, indices = index.search(question_embedding.astype("float32"), top_k)

    results = []

    for distance, index_number in zip(distances[0], indices[0]):
        if index_number == -1:
            continue

        results.append({
            "text": chunks[index_number]["text"],
            "page": chunks[index_number]["page"],
            "score": float(distance)
        })

    return results



if __name__ == "__main__":
    from rag.pdf_loader import load_pdf
    from rag.chunker import create_chunks
    from rag.embeddings import create_embeddings

    pdf_path = "uploads/check.pdf"

    pages = load_pdf(pdf_path)
    chunks = create_chunks(pages)

    embeddings = create_embeddings(chunks)

    question = input("\nEnter your question: ")

    results = retrieve_chunks(
        question,
        chunks,
        embeddings
    )

    print("\nSearching the document...")

    for i, result in enumerate(results, start=1):
        print(f"\nResult {i}")
        print(f"Page: {result['page']}")
        print(f"Distance: {result['score']}")
        print(f"Text: {result['text'][:300]}")