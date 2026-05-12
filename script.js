const GEMINI_KEY = 'AIzaSyByVuAIjUjn-0jWb7c_ynhfrVOKUOxO_VQ';
// Використовуємо 1.5-flash, вона найшвидша для тестів
const MODEL_NAME = "gemini-1.5-flash"; 

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Функція для відображення повідомлень на екрані (без бази)
function renderMessage(sender, text) {
    const isAI = sender === 'SDU_CORE';
    const groupClass = isAI ? 'ai-group' : 'user-group';
    const msgClass = isAI ? 'ai-msg' : 'user-msg';
    const headerHtml = isAI ? `<div class="msg-header">${sender}</div>` : '';

    chatBox.innerHTML += `
        <div class="msg-group ${groupClass}">
            ${headerHtml}
            <div class="message ${msgClass}">${text}</div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    renderMessage('USER', text); // Одразу показуємо твоє повідомлення

    try {
        // Пробуємо шлях v1beta, він зазвичай найбільш відкритий для нових ключів
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            renderMessage('SDU_CORE', aiText);
        } else {
            // Якщо API видало помилку, ми побачимо її текст прямо в чаті
            renderMessage('SYSTEM ERROR', JSON.stringify(data));
        }

    } catch (err) {
        renderMessage('CONNECTION ERROR', err.message);
        console.error(err);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
