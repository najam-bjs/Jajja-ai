from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


MODEL_NAME = "google/flan-t5-small"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)


def generate_answer(question, results):
    context = "\n\n".join(
        f"Page {result['page']}:\n{result['text']}"
        for result in results
    )

    prompt = f"""
Answer the question using ONLY the information provided in the context.

If the answer is not available in the context, say:
The answer was not found in the provided document.

Context:
{context}

Question:
{question}

Answer:
"""

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True
    )

    outputs = model.generate(
        **inputs,
        max_new_tokens=150
    )

    answer = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return answer

if __name__ == "__main__":
    from rag.pdf_loader import load_pdf
    from rag.chunker import create_chunks
    from rag.embeddings import create_embeddings
    from rag.retriever import retrieve_chunks

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

    print("\nGenerating answer...")

    answer = generate_answer(question, results)

    print("\nAnswer:")
    print(answer)

    print("\nSources:")

    for result in results:
        print(f"Page {result['page']}")