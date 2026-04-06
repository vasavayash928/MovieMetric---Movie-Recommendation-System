import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from movies_data import movies


class MovieRecommender:

    def __init__(self):
        self.df = pd.DataFrame(movies)
        self._build()
        print(f"Loaded {len(self.df)} movies")

    def _build(self):
        
        if "description" not in self.df.columns:
            self.df["description"] = ""
        if "director" not in self.df.columns:
            self.df["director"] = ""
        if "language" not in self.df.columns:
            self.df["language"] = "" 
            
        
        self.df["description"] = self.df["description"].fillna("")
        self.df["director"] = self.df["director"].fillna("")
        self.df["language"] = self.df["language"].fillna("")

        
        self.df["features"] = (
            self.df["genres"].apply(lambda g: " ".join(g) * 3 if isinstance(g, list) else "") + " " +
            self.df["description"] + " " +
            self.df["director"] + " " +
            self.df["language"]
        )
        
        
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["features"])
        
        print("TF-IDF Matrix successfully built!")

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000
        )
        tfidf = vectorizer.fit_transform(self.df["features"])
        self.content_sim = cosine_similarity(tfidf)

        genre_text = self.df["genres"].apply(lambda g: " ".join(g))
        genre_vec  = TfidfVectorizer()
        genre_mat  = genre_vec.fit_transform(genre_text)
        self.genre_sim = cosine_similarity(genre_mat)

        scaler = MinMaxScaler()
        self.df["rating_norm"] = scaler.fit_transform(self.df[["rating"]])
        self.df["year_norm"]   = scaler.fit_transform(self.df[["year"]])

    def recommend(self, title, top_n=6, algorithm="hybrid"):
        titles_lower = self.df["title"].str.lower()

        match = titles_lower[titles_lower == title.lower()]
        if match.empty:
            match = titles_lower[titles_lower.str.contains(title.lower(), na=False)]

        if match.empty:
            return {
                "error": f"'{title}' not found",
                "available": self.df["title"].tolist()
            }

        idx = match.index[0]

        if algorithm == "content":
            scores = self.content_sim[idx]
        elif algorithm == "genre":
            scores = self.genre_sim[idx]
        else:
            scores = (
                0.50 * self.content_sim[idx] +
                0.30 * self.genre_sim[idx] +
                0.20 * self.df["rating_norm"].values
            )

        results = []
        for i, score in enumerate(scores):
            if i == idx:
                continue
            m = self.df.iloc[i]
            results.append({
                "title":       m["title"],
                "score":       round(float(score), 4),
                "match_pct":   round(float(score) * 100, 1),
                "language":    m["language"],
                "genres":      m["genres"],
                "rating":      m["rating"],
                "year":        int(m["year"]),
                "director":    m["director"],
                "emoji":       m["emoji"],
                "description": m["description"]
            })

        results.sort(key=lambda x: x["score"], reverse=True)

        source = self.df.loc[idx]
        return {
            "source_movie": {
                "title":    source["title"],
                "language": source["language"],
                "genres":   source["genres"],
                "rating":   source["rating"],
                "emoji":    source["emoji"]
            },
            "algorithm":       algorithm,
            "total_movies":    len(self.df),
            "recommendations": results[:top_n]
        }

    def all_titles(self):
        return self.df["title"].tolist()

    def stats(self):
        return {
            "total":      len(self.df),
            "hindi":      len(self.df[self.df["language"] == "Hindi"]),
            "english":    len(self.df[self.df["language"] == "English"]),
            "gujarati":   len(self.df[self.df["language"] == "Gujarati"]),
            "avg_rating": round(self.df["rating"].mean(), 2)
        }