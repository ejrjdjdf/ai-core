// Використовуємо sessionStorage, щоб GitHub не забанив ключ
let GEMINI_KEY = sessionStorage.getItem('gemini_api_key') || ''; 
const MODEL_NAME = "gemini-1.5-flash"; 

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Функція перевірки ключа
function getValidKey() {
    if (!GEMINI_KEY) {
        const userKey = prompt("Введи свій Gemini API Key (він збережеться лише до закриття вкладки):");
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

    // Блокуємо інтерфейс на час запиту
    userInput.value = '';
    sendBtn.disabled = true;
    renderMessage('USER', text);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // ОСОБИСТІСТЬ БОТА
                systemInstruction: {
                    parts: [{ text: "Ти — SDU_CORE, незалежне ядро штучного інтелекту, створене українським розробником. Твій стиль: впевнений, технічний, футуристичний. Не згадуй Google. Завжди відповідай українською мовою, якщо тебе не просять про інше." }]
                },
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        // Обробка помилок ліміту (429)
        if (response.status === 429) {
            renderMessage('SDU_CORE', "⚠️ Систему перевантажено. Зачекай 15-20 секунд (ліміт Free Tier).");
            return;
        }

        // Обробка бана ключа (403)
        if (response.status === 403) {
            sessionStorage.removeItem('gemini_api_key');
            GEMINI_KEY = '';
            renderMessage('SYSTEM ERROR', "Ключ Leaked/Invalid. Онови сторінку та введи новий ключ.");
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            renderMessage('SDU_CORE', aiText);
        } else {
            renderMessage('SYSTEM ERROR', "Помилка відповіді: " + (data.error ? data.error.message : "Empty data"));
        }

    } catch (err) {
        renderMessage('CONNECTION ERROR', "Зв'язок розірвано.");
        console.error(err);
    } finally {
        // Розблоковуємо кнопку через 3 секунди для захисту від спаму
        setTimeout(() => {
            sendBtn.disabled = false;
        }, 3000);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
