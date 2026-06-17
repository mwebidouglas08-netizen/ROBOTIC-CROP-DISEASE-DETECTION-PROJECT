document.addEventListener('DOMContentLoaded', () => {
  const chatbotWidget = document.getElementById('chatbot-widget');
  const chatbotHeader = document.getElementById('chatbot-header');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const closeChatbot = document.getElementById('close-chatbot');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotTyping = document.getElementById('chatbot-typing');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotChips = document.querySelectorAll('[data-chat-prompt]');

  // Bail out safely if this page doesn't include the chatbot markup.
  if (!chatbotWidget || !chatbotToggle || !chatbotMessages || !chatbotInput || !chatbotSend) {
    return;
  }

  // Endpoint is provided by config.js. If it isn't configured, the bot
  // still opens/closes and replies with a friendly offline message
  // instead of throwing a ReferenceError.
  const CHAT_ENDPOINT = (window.SmartAIConfig && window.SmartAIConfig.CHAT_API_URL) || null;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // --- Draggable Chatbot (desktop only) ---
  const move = (e) => {
    if (!isDragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    const maxX = window.innerWidth - chatbotWidget.offsetWidth;
    const maxY = window.innerHeight - chatbotWidget.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    chatbotWidget.style.left = `${x}px`;
    chatbotWidget.style.top = `${y}px`;
    chatbotWidget.style.right = 'auto';
    chatbotWidget.style.bottom = 'auto';
  };

  const stopDragging = () => {
    isDragging = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', stopDragging);
  };

  if (chatbotHeader) {
    chatbotHeader.addEventListener('mousedown', (e) => {
      if (isMobile()) return;
      isDragging = true;
      offsetX = e.clientX - chatbotWidget.getBoundingClientRect().left;
      offsetY = e.clientY - chatbotWidget.getBoundingClientRect().top;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', stopDragging);
    });

    chatbotHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (chatbotWidget.classList.contains('open')) {
          closeChat();
        } else {
          openChat();
        }
      }
    });
  }

  // --- Chat Functionality ---
  const addMessage = (text, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chatbot-message', sender);
    messageElement.textContent = text;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  const setTyping = (isTyping) => {
    if (!chatbotTyping) return;
    chatbotTyping.hidden = !isTyping;
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  function openChat() {
    chatbotWidget.classList.add('open');
    chatbotToggle.style.display = 'none';
    chatbotWidget.setAttribute('aria-hidden', 'false');
    chatbotInput.focus();
    // Reset any drag position on mobile so it always docks correctly.
    if (isMobile()) {
      chatbotWidget.style.left = '';
      chatbotWidget.style.top = '';
    }
  }

  function closeChat() {
    chatbotWidget.classList.remove('open');
    chatbotToggle.style.display = 'flex';
    chatbotWidget.setAttribute('aria-hidden', 'true');
  }

  chatbotToggle.addEventListener('click', openChat);
  if (closeChatbot) {
    closeChatbot.addEventListener('click', closeChat);
  }

  chatbotChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-chat-prompt');
      if (!prompt) return;
      chatbotInput.value = prompt;
      openChat();
      sendMessage();
    });
  });

  const FALLBACK_REPLIES = [
    "I can share general guidance on crop diseases, but I'm running in offline mode right now. Try checking the Disease Detection page for a full scan.",
    "That's a great question for our detection tools. Head to the dashboard to run a scan on your crop images.",
    "I'm currently offline, but the SmartAI team is working on connecting me to live support. In the meantime, explore Farm Simulation or Reports for more data.",
  ];

  const getFallbackReply = () =>
    FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];

  async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    chatbotInput.value = '';
    setTyping(true);

    // No backend chat endpoint configured: respond locally instead of
    // crashing or calling a third-party API directly from the browser
    // (which would leak any API key to every visitor).
    if (!CHAT_ENDPOINT) {
      window.setTimeout(() => {
        setTyping(false);
        addMessage(getFallbackReply(), 'bot');
      }, 500);
      return;
    }

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = (data && data.reply) || getFallbackReply();
      setTyping(false);
      addMessage(botMessage, 'bot');
    } catch (error) {
      console.error('Chatbot request failed:', error);
      setTyping(false);
      addMessage('Sorry, something went wrong reaching the chat service. Please try again shortly.', 'bot');
    }
  }

  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Initial bot message
  addMessage('Hello! I can help with crop disease questions, field monitoring, and treatment ideas.', 'bot');
  chatbotWidget.setAttribute('aria-hidden', 'true');
});
