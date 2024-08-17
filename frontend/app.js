document.getElementById('chatForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userInput = document.getElementById('userInput').value;
    const messages = document.getElementById('messages');

    // Kullanıcı mesajını ekleyin
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userInput;
    messages.appendChild(userMessage);

    // Chatbot cevabını almak için sunucuya istek gönderin
    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userInput }),
        });

        if (!response.ok) {
            throw new Error(`HTTP hata kodu: ${response.status}`);
        }

        const data = await response.json();

        // Bot cevabını ekleyin
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.textContent = data.text;
        messages.appendChild(botMessage);

        // Mesaj kutusunu temizleyin
        document.getElementById('userInput').value = '';

        // Son mesajı görünür yapın
        messages.scrollTop = messages.scrollHeight;

    } catch (error) {
        console.error('Hata:', error);
        // Hata mesajı gösterebilirsiniz
    }
});
