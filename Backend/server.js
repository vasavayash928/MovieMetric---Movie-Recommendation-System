require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const PYTHON_ML_URL = 'http://localhost:5001';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `You are the MovieMetric Assistant, a specialized AI for a BE IT final-year project for movie recommendation system. 
    Technical Knowledge:
    - Tech Stack: HTML,CSS,javaScript with a Python Flask ML microservice.
    - ML Algorithms: TF-IDF & Cosine Similarity for recommendations; Multinomial Naive Bayes for sentiment analysis.
    - Dataset: 105+ movies including Bollywood and Gujarati cinema.
    - Project Goal: Solving choice paralysis in movie selection.
    - Created by: Yash Vasava as a part of MovieMetric Project!.
    If asked technical questions about the project, explain them using engineering terms. Keep responses concise.`
});

let moviesDB = [];


async function loadMoviesFromPython() {
    try {
        const response = await axios.get(`${PYTHON_ML_URL}/api/all_movies`);
        moviesDB = response.data.movies;
        console.log(`✅ SUCCESS: Loaded ${moviesDB.length} movies.`);
    } catch (error) {
        console.error("❌ ERROR: Could not get movies from Python.");
    }
}


app.get('/api/movies', (req, res) => {
    const { search, genre, mood } = req.query;
    let results = moviesDB;
    if (search) results = results.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    if (genre) results = results.filter(m => m.genres.includes(genre));
    res.json({ movies: results });
});


app.post('/api/reviews', async (req, res) => {
    try {
        const pyResponse = await axios.post(`${PYTHON_ML_URL}/sentiment`, req.body);
        res.json(pyResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Sentiment analysis failed." });
    }
});


app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const botReply = response.text();

        res.json({ response: botReply });
    } catch (error) {
        console.error("FULL ERROR LOG:", error);
        console.error("Gemini Error:", error.message);
        res.status(500).json({ response: "I'm having trouble thinking right now. Is the API key correct?" });
    }
});

app.listen(PORT, async () => {
    console.log(`✅ Node.js Server running on http://localhost:${PORT}`);
    await loadMoviesFromPython();
});