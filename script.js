const KEY = 'AIzaSyColLu4_IspH17YO5H5Lv2jt-M7dQBxO10'; 
const MODEL_NAME = "gemini-1.5-flash-latest";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    renderMessage('Александр', text, 'user-msg');
    userInput.value = '';

    const systemPrompt = "Ти — інтелектуальне ядро U-A-CORE 2.0. Твій творець — Олександр. Ти працюєш на i7-4790 та RX 570. Стиль: лаконічний, професійний.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\nКористувач: " + text }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        renderMessage('Core Intelligence', aiText, 'ai-msg');
    } catch (err) {
        console.error("Помилка:", err);
    }
}

function renderMessage(sender, text, className) {
    chatBox.innerHTML += `
        <div class="msg-group">
            <div class="msg-header">${sender}</div>
            <div class="message ${className}">${text}</div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
