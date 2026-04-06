async function loadAIRecommended(title) {
    const data = await postData('/recommend', { 
        movieTitle: title, 
        algorithm: 'hybrid' 
    });
    
    console.log("AI Source Movie:", data.source_movie);
    console.log("AI Recommendations:", data.recommendations);
    
}

