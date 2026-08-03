from langchain_text_splitters import RecursiveCharacterTextSplitter
from rag.pdf_loader import load_pdf


def create_chunks(pages, chunk_size=500, chunk_overlap=50):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    chunks = []

    for page in pages:

        split_text = splitter.split_text(page["text"])

        for chunk in split_text:

            chunks.append({
                "text": chunk,
                "page": page["page"]
            })

    return chunks


if __name__ == "__main__":

    pages = load_pdf("uploads/check.pdf")

    chunks = create_chunks(pages)

    print("Total chunks:", len(chunks))

    print("\nFirst chunk:")
    print(chunks[0]["text"])

    print("\nFirst chunk page:")
    print(chunks[0]["page"])