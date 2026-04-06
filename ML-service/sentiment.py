from textblob import TextBlob



SPOILER_WORDS = [
    # English
    "dies", "killed", "dead", "death", "survives", "murder",
    "ending", "twist", "revealed", "turns out", "actually is",
    "flashback", "finale", "climax", "final scene",
    "betrayal", "betrayed", "secret", "plot twist", "surprise ending",
    # Hindi 
    "mar jaata", "mar jaati", "end mein", "climax mein",
    "actually woh", "pata chalta", "raaz khulta", "villain nikla",
    "twist aata", "maut", "kill kar",
    # Gujarati 
    "ant ma", "mara jaay", "maari jaay", "secret bhar",
    "villain nikle", "ant aave"
]


def analyse(text):
    blob     = TextBlob(text)
    polarity = blob.sentiment.polarity
    subj     = blob.sentiment.subjectivity

    if polarity > 0.15:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    lower       = text.lower()
    has_spoiler = any(phrase in lower for phrase in SPOILER_WORDS)

    return {
        "sentiment":    sentiment,
        "score":        round(polarity, 3),
        "subjectivity": round(subj, 3),
        "has_spoiler":  has_spoiler,
        "confidence":   "high" if subj > 0.5 else "medium"
    }