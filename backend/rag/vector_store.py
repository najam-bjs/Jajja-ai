import faiss
import numpy as np

def create_index(embeddings):
    dimension = embeddings.shape[1]
    # Cosine similarity via Inner Product (embeddings are pre-normalized)
    index = faiss.IndexFlatIP(dimension)
    vectors = np.array(embeddings).astype("float32")
    index.add(vectors)
    return index