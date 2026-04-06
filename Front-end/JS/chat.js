function toggleChat() {
    const window = document.getElementById('chat-window');
    window.style.display = window.style.display === 'none' ? 'flex' : 'none';
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const message = input.value.trim();

    if (!message) return;

    
    container.innerHTML += `<div style="background: #3b82f6; padding: 8px 12px; border-radius: 10px; align-self: flex-end; max-width: 80%; font-size: 0.9rem;">${message}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    try {
        
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await res.json();

        
        container.innerHTML += `<div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 10px; align-self: flex-start; max-width: 80%; font-size: 0.9rem;">${data.response}</div>`;
        container.scrollTop = container.scrollHeight;
    } catch (err) {
        console.error("Chat error:", err);
    }
}


document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

