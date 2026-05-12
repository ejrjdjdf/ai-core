const KEY = 'AIzaSyColLu4_IspH17YO5H5Lv2jt-M7dQBxO10'; 
const MODEL_NAME = "gemini-1.5-flash-latest";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Рендер користувача (справа, без хедера)
    renderMessage('USER', text, 'user-group', 'user-msg');
    userInput.value = '';

    const systemPrompt = "Ти — інтелектуальне ядро U-A-CORE 2.0. Стиль SDU_CORP. Відповідай професійно та лаконічно.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\nЗапит: " + text }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Рендер ШІ (зліва, з хедером SDU_CORE)
        renderMessage('SDU_CORE', aiText, 'ai-group', 'ai-msg');
    } catch (err) {
        console.error("Помилка:", err);
    }
}

function renderMessage(sender, text, groupClass, msgClass) {
    // Показуємо хедер ТІЛЬКИ для SDU_CORE
    const headerHtml = (sender === 'SDU_CORE') ? `<div class="msg-header">${sender}</div>` : '';
    
    chatBox.innerHTML += `
        <div class="msg-group ${groupClass}">
            ${headerHtml}
            <div class="message ${msgClass}">${text}</div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
