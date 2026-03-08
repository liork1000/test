import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Book
from services.claude_service import get_recommendations
from services.open_library import enrich_book

router = APIRouter()


class RecommendRequest(BaseModel):
    count: int = 5


@router.post("/")
async def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    count = max(1, min(req.count, 20))

    books = db.query(Book).all()
    books_data = [{"title": b.title, "author": b.author} for b in books]

    recs = await get_recommendations(books_data, count)

    # Enrich all recommendations in parallel
    enriched = await asyncio.gather(
        *[enrich_book(r["title"], r["author"]) for r in recs]
    )

    for rec, extra in zip(recs, enriched):
        rec.update(extra)

    return recs
