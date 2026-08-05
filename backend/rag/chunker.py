from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_chunks(pages, chunk_size=1000, chunk_overlap=150):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
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