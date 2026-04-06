

async function updateUIStats() {
    const res = await fetch(`${API_BASE}/movies/stats`);
    const stats = await res.json();

    
    document.getElementById('totalMovies').innerText = stats.total;
    document.getElementById('avgRating').innerText = stats.avgRating;
}
let currentMoviesList = [];
let selectedMovieForAI = "";


async function fetchMovies() {
    const searchVal = document.getElementById('catalogSearch')?.value || "";
    const genreVal = document.getElementById('genreFilter')?.value || "";
    const moodVal = document.getElementById('moodFilter')?.value || "";

    let url = `http://localhost:5000/api/movies?search=${searchVal}`;
    if (genreVal) url += `&genre=${genreVal}`;
    if (moodVal) url += `&mood=${moodVal}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        currentMoviesList = data.movies; 
        renderGrid(currentMoviesList);
    } catch (err) {
        console.error("Failed to fetch movies:", err);
    }
}


function renderGrid(movies) {
    const grid = document.getElementById('movieResultsGrid');
    
    if (!movies || movies.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: white;">No movies found. Try a different search.</p>`;
        return;
    }

    
    grid.innerHTML = movies.map((movie, index) => `
        <div class="movie-result-card" onclick="openModal(${index})" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 25px 20px; text-align: center; cursor: pointer; transition: 0.3s;">
            
            <h4 style="color: white; margin-bottom: 5px;">${movie.title}</h4>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">${movie.genres[0]} • ${movie.year}</p>
            <div class="rating" style="color: #ffcc00; font-weight: bold; margin-top: 10px;">★ ${movie.rating}</div>
        </div>
    `).join('');
}


function handleSearch(event) {
    if (event.key === "Enter") {
        fetchMovies();
    }
}


function openModal(index) {
    const movie = currentMoviesList[index];
    selectedMovieForAI = movie.title; 
    const reviewBox = document.getElementById('userReviewText');
    const resultDiv = document.getElementById('sentimentResult');
    if (reviewBox) reviewBox.value = ""; 
    if (resultDiv) resultDiv.style.display = 'none';

   
    document.getElementById('modalTitle').innerText = movie.title;
    document.getElementById('modalYear').innerText = movie.year;
    document.getElementById('modalLang').innerText = movie.language;
    document.getElementById('modalRating').innerText = movie.rating;
    document.getElementById('modalDesc').innerText = movie.description;

    
    const tagsContainer = document.getElementById('modalTags');
    let tagsHTML = movie.genres.map(g => `<span class="tag" style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 15px; margin-right: 5px; font-size: 0.8rem; color: white;">${g}</span>`).join('');
    if (movie.mood_tags) {
        tagsHTML += movie.mood_tags.map(m => `<span class="tag mood" style="background: rgba(255,204,0,0.2); color: #ffcc00; padding: 5px 10px; border-radius: 15px; margin-right: 5px; font-size: 0.8rem;">#${m}</span>`).join('');
    }
    tagsContainer.innerHTML = tagsHTML;

    
    document.getElementById('movieModal').classList.add('show');
}

function closeModal() {
    document.getElementById('movieModal').classList.remove('show');
}


async function triggerAIRecommender() {
    closeModal();
    console.log(`Asking Python for movies similar to: ${selectedMovieForAI}`);
    
    try {
        const res = await fetch('http://localhost:5000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie_title: selectedMovieForAI, algorithm: 'hybrid' })
        });
        const data = await res.json();
        
        
        if(data.recommendations) {
            renderGrid(data.recommendations);
            
            document.querySelector('.catalog-header h2').innerHTML = `AI Recommendations for <span>${selectedMovieForAI}</span>`;
        } else {
            alert("Movie not found in Python database.");
        }
    } catch(err) {
        alert("Failed to connect to ML Engine.");
    }
}


window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingSearch = urlParams.get('search');

    
    if (incomingSearch) {
        const searchInput = document.getElementById('catalogSearch');
        if (searchInput) {
            searchInput.value = incomingSearch;
        }
        
        const headerTitle = document.querySelector('.catalog-header h2');
        if (headerTitle) {
            headerTitle.innerHTML = `Results for <span>"${incomingSearch}"</span>`;
        }
    }
    fetchMovies();
});

async function analyzeSentiment() {
    const textInput = document.getElementById('userReviewText');
    const resultDiv = document.getElementById('sentimentResult');
    const label = document.getElementById('sentimentLabel');
    const confLabel = document.getElementById('sentimentConfidence');

    if (!textInput.value.trim()) return alert("Please type a review!");

    
    resultDiv.style.display = 'block';
    resultDiv.style.background = "rgba(255, 255, 255, 0.1)";
    label.innerText = "⏳ Analyzing...";
    confLabel.innerText = "";

    try {
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput.value })
        });
        
        const data = await res.json();

        
        if (data.sentiment === "Positive") {
            resultDiv.style.background = "rgba(34, 197, 94, 0.2)";
            resultDiv.style.color = "#4ade80";
            label.innerHTML = `😊 Positive Review`;
        } else {
            resultDiv.style.background = "rgba(239, 68, 68, 0.2)";
            resultDiv.style.color = "#f87171";
            label.innerHTML = `😞 Negative Review`;
        }

        const score = data.confidence ? Math.round(data.confidence * 100) : 0;
        confLabel.innerText = `AI Confidence Score: ${score}%`;

    } catch (err) {
        label.innerText = "❌ Server Offline";
        console.error(err);
    }
}