import asyncio

from src.llm.agent import CustomerSupportAgent


async def main() -> None:
    agent = CustomerSupportAgent({})
    await agent.initialize()
    for query in ["What is your return policy?", "How long is shipping?"]:
        context = await agent._rag_search(query)
        print(f"\nQuery: {query}\n{context}\n")


if __name__ == "__main__":
    asyncio.run(main())
