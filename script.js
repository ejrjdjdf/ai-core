// Використовуємо sessionStorage для захисту ключа на GitHub
let GEMINI_KEY = sessionStorage.getItem('AIzaSyBcw-ACv0RnjFnA92U2822gprGV6sEw3U4') || ''; 
// Раз у тебе працюють тільки нові моделі — ставимо 2.5
const MODEL_NAME = "gemini-2.5-flash"; 

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function getValidKey() {
    if (!GEMINI_KEY) {
        const userKey = prompt("Введи свій Gemini API Key (для 2.5/3 моделей):");
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
    if (!key) return;

    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    sendBtn.disabled = true; // Блокуємо спам
    renderMessage('USER', text);

    try {
        // Оскільки моделі експериментальні (2.5/3), використовуємо v1beta
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: "Ти — SDU_CORE, незалежне ядро ШІ, створене українським розробником. Ти працюєш на базі експериментальних систем 2.5/3. Твій стиль: футуристичний, лаконічний. Не згадуй Google. Відповідай українською." }]
                },
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (response.status === 429) {
            renderMessage('SDU_CORE', "⚠️ Експериментальний ліміт! Зачекай 15 секунд.");
            return;
        }

        if (response.status === 403 || response.status === 401) {
            sessionStorage.removeItem('gemini_api_key');
            GEMINI_KEY = '';
            renderMessage('SYSTEM ERROR', "Ключ не підходить або заблокований. Онови сторінку.");
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            renderMessage('SDU_CORE', aiText);
        } else {
            renderMessage('SYSTEM ERROR', "Помилка: " + (data.error ? data.error.message : "Невідомий збій"));
        }

    } catch (err) {
        renderMessage('CONNECTION ERROR', "Збій зв'язку з ядром.");
    } finally {
        // Робимо кнопку активною через 3 сек
        setTimeout(() => { sendBtn.disabled = false; }, 3000);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
