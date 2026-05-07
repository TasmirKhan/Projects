import os
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
                metadatas=[{"title": d["title"]} for d in DOCS],
            )

    async def _rag_search(self, query: str) -> str:
        results = self.collection.query(
            query_texts=[query],
            n_results=3,
            include=["documents", "metadatas", "distances"],
        )
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        if not docs:
            return "No matching policy found in the knowledge base."

        formatted_results = []
        for doc, meta in zip(docs, metas):
            title = meta.get("title", "Untitled") if meta else "Untitled"
            formatted_results.append(f"**{title}**\n{doc}")
        return "\n\n".join(formatted_results)

    async def process_query(self, query: str) -> str:
        context = await self._rag_search(query)
        prompt = (
            "You are a customer support assistant. Answer clearly and only use the provided context.\n\n"
            f"Context:\n{context}\n\nCustomer query: {query}"
        )
        response = await self.client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content or "Sorry, I could not generate a response."
