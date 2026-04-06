import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

class SentimentAnalyzer:
    def __init__(self):
        data = {
            'text': [
                'good movie', 'great film', 'loved it', 'excellent', 'amazing',
                'best movie ever', 'fantastic story', 'superb acting', 'wonderful', 'nice',
                'bad movie', 'boring', 'worst film', 'hated it', 'terrible',
                'waste of time', 'awful plot', 'not good', 'so slow', 'poor'
            ],
            'label': ['pos']*10 + ['neg']*10
        }
        df = pd.DataFrame(data)

        
        self.model = Pipeline([
            ('vectorizer', CountVectorizer()),
            ('nb', MultinomialNB(alpha=1.0)) 
        ])

        self.model.fit(df['text'], df['label'])
        print("✅ Sentiment Engine: Re-trained and Balanced.")

    def predict(self, text):
        text = text.lower().strip()
        prediction = self.model.predict([text])[0]
        probs = self.model.predict_proba([text])[0]
        confidence = max(probs)
        return prediction, confidence