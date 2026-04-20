/**
 * SalesAI Chat Widget - Embeddable script for online stores.
 *
 * Usage: Add this to your store's HTML:
 * <script src="https://your-domain.com/widget/chat-widget.js"
 *         data-api-key="YOUR_API_KEY"
 *         data-theme="light"
 *         data-lang="en">
 * </script>
 */
(function () {
  'use strict';

  const script = document.currentScript;
  const API_KEY = script?.getAttribute('data-api-key') || '';
  const THEME = script?.getAttribute('data-theme') || 'light';
  const LANG = script?.getAttribute('data-lang') || 'en';
  const API_URL = script?.getAttribute('data-api-url') || 'https://api.salesai.app';

  const COLORS = {
    light: { bg: '#ffffff', primary: '#2563eb', text: '#1f2937', muted: '#6b7280', border: '#e5e7eb' },
    dark: { bg: '#1f2937', primary: '#3b82f6', text: '#f9fafb', muted: '#9ca3af', border: '#374151' },
  };

  const c = COLORS[THEME] || COLORS.light;

  function createWidget() {
    const container = document.createElement('div');
    container.id = 'salesai-chat-widget';
    container.innerHTML = `
      <style>
        #salesai-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .salesai-btn { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; background: ${c.primary}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,99,235,0.3); z-index: 9999; transition: transform 0.2s; }
        .salesai-btn:hover { transform: scale(1.1); }
        .salesai-btn svg { width: 28px; height: 28px; fill: white; }
        .salesai-panel { position: fixed; bottom: 100px; right: 24px; width: 380px; max-height: 520px; background: ${c.bg}; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); z-index: 9999; display: none; flex-direction: column; overflow: hidden; border: 1px solid ${c.border}; }
        .salesai-panel.open { display: flex; }
        .salesai-header { padding: 16px 20px; background: ${c.primary}; color: white; display: flex; align-items: center; gap: 12px; }
        .salesai-header h3 { font-size: 16px; font-weight: 600; }
        .salesai-messages { flex: 1; overflow-y: auto; padding: 16px; min-height: 300px; }
        .salesai-msg { margin-bottom: 12px; max-width: 80%; }
        .salesai-msg.user { margin-left: auto; }
        .salesai-msg p { padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
        .salesai-msg.bot p { background: #f3f4f6; color: ${c.text}; border-bottom-left-radius: 4px; }
        .salesai-msg.user p { background: ${c.primary}; color: white; border-bottom-right-radius: 4px; }
        .salesai-input { display: flex; padding: 12px; border-top: 1px solid ${c.border}; gap: 8px; }
        .salesai-input input { flex: 1; padding: 10px 14px; border: 1px solid ${c.border}; border-radius: 10px; outline: none; font-size: 14px; color: ${c.text}; background: ${c.bg}; }
        .salesai-input button { padding: 10px 16px; background: ${c.primary}; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; }
      </style>

      <button class="salesai-btn" onclick="document.querySelector('.salesai-panel').classList.toggle('open')">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>

      <div class="salesai-panel">
        <div class="salesai-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          <h3>SalesAI Assistant</h3>
        </div>
        <div class="salesai-messages" id="salesai-messages">
          <div class="salesai-msg bot"><p>Hi! How can I help you today?</p></div>
        </div>
        <div class="salesai-input">
          <input type="text" id="salesai-input" placeholder="Type a message..." onkeydown="if(event.key==='Enter')window.__salesaiSend()" />
          <button onclick="window.__salesaiSend()">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const messages = [];

    window.__salesaiSend = async function () {
      const input = document.getElementById('salesai-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const msgsEl = document.getElementById('salesai-messages');
      msgsEl.innerHTML += `<div class="salesai-msg user"><p>${escapeHtml(text)}</p></div>`;
      msgsEl.scrollTop = msgsEl.scrollHeight;

      messages.push({ role: 'user', content: text });

      try {
        const res = await fetch(`${API_URL}/api/chat/widget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
          body: JSON.stringify({ messages, lang: LANG }),
        });
        const data = await res.json();
        const reply = data.message?.content || 'Sorry, something went wrong.';
        messages.push({ role: 'assistant', content: reply });
        msgsEl.innerHTML += `<div class="salesai-msg bot"><p>${escapeHtml(reply)}</p></div>`;
      } catch {
        msgsEl.innerHTML += `<div class="salesai-msg bot"><p>Connection error. Please try again.</p></div>`;
      }
      msgsEl.scrollTop = msgsEl.scrollHeight;
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
