from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import MovieRecommender
from sentiment_analyzer import SentimentAnalyzer
from movies_data import movies 

app = Flask(__name__)
CORS(app) 


print("Starting MovieMetric AI Engines...")
rec = MovieRecommender()  
analyzer = SentimentAnalyzer() 
print("✅ AI Engines Ready!")


@app.get('/api/all_movies')
def get_all_movies():
    return jsonify({"movies": movies})


@app.post('/api/recommend')
def recommend():
    data = request.json
    movie_title = data.get('movie_title')
    
    
    recommendations = rec.get_recommendations(movie_title)
    
    if recommendations:
        return jsonify({"recommendations": recommendations})
    else:
        return jsonify({"error": "Movie not found"}), 404

@app.route('/sentiment', methods=['POST'])
def sentiment_analysis():
    data = request.get_json(force=True)
    text = data.get('text', '')
    
    if not text:
        return jsonify({"sentiment": "Neutral", "confidence": 0})

    
    result, score = analyzer.predict(text)
    
    
    label = "Positive" if result == 'pos' else "Negative"
    
    print(f"DEBUG: '{text}' -> {label} (Conf: {score:.2f})")
    
    return jsonify({
        "sentiment": label,
        "confidence": float(score) 
    })

if __name__ == '__main__':
    
    app.run(port=5001, debug=True, use_reloader=False)