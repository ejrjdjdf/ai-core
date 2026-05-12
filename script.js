// Ми не пишемо ключ тут, щоб GitHub його не забанив
let GEMINI_KEY = sessionStorage.getItem('AIzaSyBcw-ACv0RnjFnA92U2822gprGV6sEw3U4') || ''; 
const MODEL_NAME = "gemini-1.5-flash"; 

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Перевірка та запит ключа
function getValidKey() {
    if (!GEMINI_KEY) {
        const userKey = prompt("Введи свій Gemini API Key (він збережеться лише на цю сесію):");
        if (userKey) {
            GEMINI_KEY = userKey;
            sessionStorage.setItem('gemini_api_key', userKey);
        }
    }
    return GEMINI_KEY;
}

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
    const key = getValidKey();
    if (!key) {
        alert("Без API ключа SDU_CORE не зможе відповісти.");
        return;
    }

    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    renderMessage('USER', text);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        // Обробка помилок (ліміти або витік)
        if (response.status === 429) {
            renderMessage('SDU_CORE', "⚠️ Ліміт вичерпано (5 запитів на хв). Зачекай трохи.");
            return;
        }

        if (response.status === 403) {
            sessionStorage.removeItem('gemini_api_key'); // Видаляємо поганий ключ
            GEMINI_KEY = '';
            renderMessage('SYSTEM ERROR', "Ключ заблоковано (Leaked). Створи новий в AI Studio.");
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            renderMessage('SDU_CORE', aiText);
        } else {
            renderMessage('SYSTEM ERROR', data.error ? data.error.message : "Невідома помилка API.");
            console.error("Full Data:", data);
        }

    } catch (err) {
        renderMessage('CONNECTION ERROR', "Помилка мережі: " + err.message);
        console.error(err);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
