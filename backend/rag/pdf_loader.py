from pypdf import PdfReader


def load_pdf(file_path):
    reader = PdfReader(file_path)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        pages.append({
            "page": page_number,
            "text": text or ""
        })

    return pages

if __name__ == "__main__":
    pdf_path = "uploads/check.pdf"

    pages = load_pdf(pdf_path)

    print("PDF loaded successfully.")
    print("Total pages:", len(pages))

    full_text = "\n".join(page["text"] for page in pages)

    print("\nFirst 500 characters:")
    print(full_text[:500])