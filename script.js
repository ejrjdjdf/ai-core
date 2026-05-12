const KEY = 'AIzaSyColLu4_IspH17YO5H5Lv2jt-M7dQBxO10'; 
const MODEL_NAME = "gemini-1.5-flash-latest";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Рендеримо повідомлення користувача (справа)
    renderMessage('USER_COMMAND', text, 'user-group', 'user-msg');
    userInput.value = '';

    const systemPrompt = "Ти — інтелектуальне ядро U-A-CORE 2.0. Стиль SDU_CORP. Відповідай лаконічно.";

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
        
        // Рендеримо відповідь ядра (зліва)
        renderMessage('SDU_CORE', aiText, 'ai-group', 'ai-msg');
    } catch (err) {
        console.error("Помилка:", err);
    }
}

function renderMessage(sender, text, groupClass, msgClass) {
    chatBox.innerHTML += `
        <div class="msg-group ${groupClass}">
            <div class="msg-header">${sender}</div>
            <div class="message ${msgClass}">${text}</div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
