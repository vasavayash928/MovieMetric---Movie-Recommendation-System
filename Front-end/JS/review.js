async function updateUIStats() {
    const res = await fetch(`${API_BASE}/movies/stats`);
    const stats = await res.json();

    
    document.getElementById('totalMovies').innerText = stats.total;
    document.getElementById('avgRating').innerText = stats.avgRating;
}