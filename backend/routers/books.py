from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Book
from services.claude_service import parse_book_input

router = APIRouter()


class ParseRequest(BaseModel):
    raw_text: str


class BookCreate(BaseModel):
    title: str
    author: str


class BookOut(BaseModel):
    id: int
    title: str
    author: str

    class Config:
        from_attributes = True


@router.post("/parse")
async def parse_book(req: ParseRequest):
    """Parse free-form text into book title + author using Claude."""
    result = await parse_book_input(req.raw_text)
    return result


@router.post("/", response_model=BookOut)
def add_book(book: BookCreate, db: Session = Depends(get_db)):
    db_book = Book(title=book.title.strip(), author=book.author.strip())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    return db.query(Book).order_by(Book.created_at.desc()).all()


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"ok": True}
