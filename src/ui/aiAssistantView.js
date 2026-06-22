export const AIAssistantView = {
  chatHistory: [
    { sender: 'bot', text: "Hello! I am your HealthGuardian AI Assistant. How can I help you with your symptoms, lab reports, or health reminders today?" }
  ],

  render() {
    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in no-print">
        <i data-lucide="sparkles" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Clinical AI Assistant:</strong> Ask questions about your biomarkers, trends, symptoms, or medication schedules. Our AI provides supportive, clinical guidance to prepare you for your next physical doctor visit.
        </div>
      </div>

      <div class="chat-container animate-fade-in">
        <div class="chat-header">
          <div class="chat-avatar">🤖</div>
          <div>
            <div class="chat-title">HealthGuardian AI Assistant</div>
            <div class="chat-status">● Secure AI Medical Interpreter</div>
          </div>
        </div>

        <div class="chat-messages" id="chat-messages-box">
          ${this.chatHistory.map(msg => `
            <div class="chat-message ${msg.sender}">
              ${msg.text.replace(/\n/g, '<br>')}
            </div>
          `).join('')}
        </div>

        <div class="chat-input-area">
          <input type="text" class="chat-input" id="chat-user-input" placeholder="Ask a health question (e.g. What does high TSH level mean?)" />
          <button class="btn-chat-send" id="btn-chat-submit">
            <i data-lucide="send" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  afterRender() {
    const chatInput = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('btn-chat-submit');
    const messagesBox = document.getElementById('chat-messages-box');

    const scrollToBottom = () => {
      if (messagesBox) {
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }
    };

    scrollToBottom();

    const handleSend = async () => {
      const textVal = chatInput.value.trim();
      if (!textVal) return;

      // Append user message
      this.chatHistory.push({ sender: 'user', text: textVal });
      
      // Update UI
      if (messagesBox) {
        const userMsgNode = document.createElement('div');
        userMsgNode.className = 'chat-message user';
        userMsgNode.innerHTML = textVal.replace(/\n/g, '<br>');
        messagesBox.appendChild(userMsgNode);
      }
      chatInput.value = '';
      scrollToBottom();

      // Append bot loading indicator
      let botMsgNode = null;
      if (messagesBox) {
        botMsgNode = document.createElement('div');
        botMsgNode.className = 'chat-message bot';
        botMsgNode.innerHTML = 'Thinking...';
        messagesBox.appendChild(botMsgNode);
        scrollToBottom();
      }

      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: textVal })
        });

        if (!response.ok) {
          throw new Error("Could not reach Gemini service.");
        }

        const data = await response.json();
        
        // Remove loading and append real reply
        this.chatHistory.push({ sender: 'bot', text: data.response });
        if (botMsgNode) {
          botMsgNode.innerHTML = data.response.replace(/\n/g, '<br>');
        }
      } catch (err) {
        this.chatHistory.push({ sender: 'bot', text: `Sorry, I encountered an issue: ${err.message}. Please try again.` });
        if (botMsgNode) {
          botMsgNode.innerHTML = `Sorry, I encountered an issue: ${err.message}. Please try again.`;
          botMsgNode.style.color = 'var(--accent-danger)';
        }
      }
      scrollToBottom();
    };

    if (sendBtn) {
      sendBtn.addEventListener('click', handleSend);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSend();
        }
      });
      chatInput.focus();
    }
  }
};
