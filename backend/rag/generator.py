import os
from dotenv import load_dotenv

# Provider SDK imports (safely wrapped so missing dependencies won't crash the server)
try:
    from google import genai
except ImportError:
    genai = None

try:
    import openai
except ImportError:
    openai = None

try:
    import anthropic
except ImportError:
    anthropic = None

load_dotenv()

# Prioritized multi-provider pipeline using valid active model identifiers
MODEL_PIPELINE = [
    # --- Primary: Gemini Models ---
    {"provider": "gemini", "model": "gemini-2.5-flash"},
    {"provider": "gemini", "model": "gemini-2.0-flash"},
    {"provider": "gemini", "model": "gemini-2.5-pro"},
    {"provider": "gemini", "model": "gemini-1.5-flash"},

    # --- Fallback 1: OpenAI (ChatGPT) ---
    {"provider": "openai", "model": "gpt-4o-mini"},
    {"provider": "openai", "model": "gpt-4o"},

    # --- Fallback 2: Anthropic (Claude) ---
    {"provider": "anthropic", "model": "claude-3-5-haiku-latest"},
    {"provider": "anthropic", "model": "claude-3-5-sonnet-latest"},
]


def _call_gemini(model_name: str, prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment.")
    if not genai:
        raise ImportError("google-genai package is not installed.")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    return response.text


def _call_openai(model_name: str, prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set in environment.")
    if not openai:
        raise ImportError("openai package is not installed.")

    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    return response.choices[0].message.content


def _call_anthropic(model_name: str, prompt: str) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set in environment.")
    if not anthropic:
        raise ImportError("anthropic package is not installed.")

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model_name,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text


def generate_answer(question: str, results: list) -> str:
    context = "\n\n".join(
        f"[Page {result['page']}]: {result['text']}"
        for result in results
    )

    prompt = f"""
You are JajjaAI, a document intelligence assistant.

Answer the question strictly based on the context provided below.

Rules:
- Give a direct, accurate, and concise answer.
- Rely ONLY on the provided context. Do not invent details.
- If the answer cannot be found in the context, reply exactly: "The answer was not found in the provided document."

Context:
{context}

Question:
{question}
"""

    for item in MODEL_PIPELINE:
        provider = item["provider"]
        model_name = item["model"]

        try:
            print(f"Attempting response using [{provider.upper()}] model: {model_name}...")

            if provider == "gemini":
                return _call_gemini(model_name, prompt)
            elif provider == "openai":
                return _call_openai(model_name, prompt)
            elif provider == "anthropic":
                return _call_anthropic(model_name, prompt)

        except Exception as e:
            print(f"[❌] Provider '{provider}' with model '{model_name}' failed. Reason: {str(e)}")

    return "All configured AI model providers (Gemini, ChatGPT, Claude) failed or are out of quota. Please check your API keys and rate limits."