const GEMINI_KEY = 'AIzaSyByVuAIjUjn-0jWb7c_ynhfrVOKUOxO_VQ';
const MODEL_NAME = "gemini-1.5-flash-latest";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 1. ФУНКЦІЯ ВІДПРАВКИ
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || !window.dbPush) return; // Перевірка чи завантажився Firebase

    userInput.value = '';
    
    // Зберігаємо юзера в Realtime Database
    window.dbPush(window.dbRef(window.db, 'messages'), {
        sender: 'USER',
        text: text,
        timestamp: Date.now()
    });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Ти — ядро SDU_CORE. Відповідай лаконічно. Запит: " + text }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // Зберігаємо відповідь ШІ
        window.dbPush(window.dbRef(window.db, 'messages'), {
            sender: 'SDU_CORE',
            text: aiText,
            timestamp: Date.now()
        });

    } catch (err) {
        console.error("Помилка API:", err);
    }
}

// 2. СЛУХАЄМО БАЗУ (Авто-оновлення екрану)
function initSync() {
    if (!window.dbOnValue) {
        setTimeout(initSync, 100); // Чекаємо завантаження Firebase модуля
        return;
    }
    
    window.dbOnValue(window.dbRef(window.db, 'messages'), (snapshot) => {
        chatBox.innerHTML = '';
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(msg => {
                renderMessage(msg.sender, msg.text);
            });
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    });
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
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// Запускаємо синхронізацію
initSync();
