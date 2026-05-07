import os
from datetime import datetime
from typing import Any

import chromadb
from openai import AsyncOpenAI

DOCS = [
    {"title": "Return Policy", "content": "Returns are accepted within 30 days with original receipt."},
    {"title": "Refund Timeline", "content": "Refunds are processed in 5-7 business days after inspection."},
    {"title": "Shipping Times", "content": "Standard shipping is 3-5 business days. Express is 1-2 days."},
    {"title": "International Shipping", "content": "International shipping may take 7-14 business days."},
]


class CustomerSupportAgent:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.client = AsyncOpenAI(api_key=config.get("api_key") or os.getenv("OPENAI_API_KEY"))
        self.model = config.get("model", os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
        self.temperature = float(config.get("temperature", 0.2))
        self.db = chromadb.PersistentClient(path=config.get("db_path", ".chroma"))
        self.collection = self.db.get_or_create_collection("customer_support_kb")

    async def initialize(self) -> None:
        if self.collection.count() == 0:
            self.collection.add(
                ids=[f"doc_{i}" for i in range(len(DOCS))],
                documents=[d["content"] for d in DOCS],
                metadatas=[{"title": d["title"], "source": "default", "created_at": datetime.utcnow().isoformat()} for d in DOCS],
            )

    async def ingest_document(self, title: str, content: str, source: str = "upload") -> str:
        doc_id = f"{source}_{abs(hash(title + content))}"
        self.collection.upsert(
            ids=[doc_id],
            documents=[content],
            metadatas=[{"title": title, "source": source, "created_at": datetime.utcnow().isoformat()}],
        )
        return doc_id

    async def _rag_search(self, query: str) -> dict[str, Any]:
        results = self.collection.query(query_texts=[query], n_results=3, include=["documents", "metadatas", "distances"])
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        if not docs:
            return {"context": "No matching policy found in the knowledge base.", "sources": []}

        formatted = []
        sources = []
        for doc, meta, distance in zip(docs, metas, distances):
            title = meta.get("title", "Untitled") if meta else "Untitled"
            source = meta.get("source", "unknown") if meta else "unknown"
            formatted.append(f"**{title}**\n{doc}")
            sources.append({"title": title, "source": source, "distance": float(distance)})
        return {"context": "\n\n".join(formatted), "sources": sources}

    async def process_query(self, query: str, history: list[dict[str, str]] | None = None) -> dict[str, Any]:
        rag = await self._rag_search(query)
        history_text = "\n".join([f"{m['role']}: {m['content']}" for m in (history or [])[-6:]])
        prompt = (
            "You are a professional customer support assistant. Be concise, empathetic, and grounded in provided KB context. "
            "If information is missing, explicitly say so and offer next steps.\n\n"
            f"Conversation history:\n{history_text or 'N/A'}\n\n"
            f"Context:\n{rag['context']}\n\nCustomer query: {query}"
        )
        response = await self.client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.choices[0].message.content or "Sorry, I could not generate a response."
        return {"response": text, "sources": rag["sources"], "context": rag["context"]}
