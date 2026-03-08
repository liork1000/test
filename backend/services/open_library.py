import httpx

OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json"
COVER_BASE = "https://covers.openlibrary.org/b/id"


async def enrich_book(title: str, author: str) -> dict:
    """
    Fetch cover image and description from Open Library.
    Returns: {cover_url, description, ol_key}
    Falls back to empty dict on any error.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                OPEN_LIBRARY_SEARCH,
                params={"title": title, "author": author, "limit": 1, "fields": "key,cover_i,first_sentence"},
            )
            response.raise_for_status()
            data = response.json()

        docs = data.get("docs", [])
        if not docs:
            return {}

        doc = docs[0]
        cover_id = doc.get("cover_i")
        cover_url = f"{COVER_BASE}/{cover_id}-M.jpg" if cover_id else None
        first_sentence = doc.get("first_sentence", {})
        description = first_sentence.get("value", "") if isinstance(first_sentence, dict) else ""

        return {
            "cover_url": cover_url,
            "description": description,
            "ol_key": doc.get("key", ""),
        }
    except Exception:
        return {}
