import json
import anthropic

client = anthropic.AsyncAnthropic()
MODEL = "claude-opus-4-6"


async def parse_book_input(raw_text: str) -> dict:
    """
    Parse free-form user text into structured book data.
    Returns: {title, author, confidence, notes}
    """
    prompt = f"""המשתמש הזין את הטקסט הבא לתיאור ספר שקרא: "{raw_text}"

חלץ את שם הספר ושם המחבר.
אם חסר מידע, השתמש בידע שלך על ספרים עבריים ובינלאומיים כדי להשלים את הפרטים.
אם הטקסט מעורפל, תן את הניחוש הטוב ביותר שלך.

החזר JSON בלבד (ללא טקסט נוסף):
{{"title": "שם הספר", "author": "שם המחבר", "confidence": "high/medium/low", "notes": "הערה קצרה אם יש"}}"""

    async with client.messages.stream(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        text = await stream.get_final_text()

    # Extract JSON from response
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)


async def get_recommendations(books: list[dict], count: int) -> list[dict]:
    """
    Get personalized book recommendations based on reading history.
    Returns: [{title, author, reason}]
    """
    if not books:
        book_list = "המשתמש עדיין לא הוסיף ספרים. המלץ על ספרים פופולריים כלליים."
    else:
        book_list = "\n".join(
            f"- {b['title']} מאת {b['author']}" for b in books
        )

    prompt = f"""אני אוהב לקרוא ספרים. קראתי את הספרים הבאים:
{book_list}

אנא המלץ לי על {count} ספרים שלא קראתי, שאתה חושב שיתאימו לי ביותר על סמך הרשימה שלי.
כדאי לגוון - לא תמיד אותו ז'אנר.

החזר JSON בלבד (ללא טקסט נוסף), רשימה של {count} פריטים:
[{{"title": "שם הספר", "author": "שם המחבר", "reason": "סיבה קצרה ומשכנעת בעברית"}}]"""

    async with client.messages.stream(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        text = await stream.get_final_text()

    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)
