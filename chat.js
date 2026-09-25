// ==========================================
// Capitan Vexor - Chat System
// ==========================================

const CHAT_SUPABASE_URL = 'https://pvghoflyhkppgpralypc.supabase.co';
const CHAT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2hvZmx5aGtwcGdwcmFseXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjcwODIsImV4cCI6MjEwNTkwMzA4Mn0.yaYfCSXUegLwB3AQDuj733xyCZK49J95W2Gey6EAiWw';

// ==== Chat State ====
let chatSessionId = localStorage.getItem('cv_chat_session') || null;
let chatVisitorName = localStorage.getItem('cv_chat_name') || null;
let chatRealtimeChannel = null;

// ==== Init Chat ====
function initChat() {
  // اگه قبلاً چت داشته، مستقیم باز کن
  if (chatSessionId && chatVisitorName) {
    document.getElementById('chatNameForm').style.display = 'none';
    document.getElementById('chatMessages').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    loadMessages();
    subscribeToMessages();
  }
}

// ==== Start Chat (ثبت نام مشتری) ====
async function startChat() {
  const nameInput = document.getElementById('visitorNameInput');
  const phoneInput = document.getElementById('visitorPhoneInput');
  const name = nameInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!name) {
    alert('لطفاً اسمت رو بنویس!');
    return;
  }

  // ساخت session_id یونیک
  const sessionId = 'cv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  try {
    // ساخت چت جدید
    const res = await fetch(`${CHAT_SUPABASE_URL}/rest/v1/chats`, {
      method: 'POST',
      headers: {
        'apikey': CHAT_SUPABASE_KEY,
        'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        visitor_name: name,
        visitor_phone: phone,
        session_id: sessionId,
        status: 'open'
      })
    });

    if (!res.ok) throw new Error('خطا در ساخت چت');

    const data = await res.json();
    const chatId = data[0].id;

    // ذخیره توی localStorage
    localStorage.setItem('cv_chat_session', sessionId);
    localStorage.setItem('cv_chat_name', name);
    localStorage.setItem('cv_chat_id', chatId);

    chatSessionId = sessionId;
    chatVisitorName = name;

    // نمایش پیام‌ها
    document.getElementById('chatNameForm').style.display = 'none';
    document.getElementById('chatMessages').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';

    // پیام خوش‌آمد
    await sendMessage('سلام! خوش اومدی به کاپیتان وکتور 💎 چطور می‌تونم کمکت کنم؟', 'admin');

    loadMessages();
    subscribeToMessages();

  } catch (err) {
    alert('خطا: ' + err.message);
  }
}

// ==== Send Message ====
async function sendMessage(text, sender = 'visitor') {
  if (!text || !text.trim()) return;

  const chatId = localStorage.getItem('cv_chat_id');
  if (!chatId) return;

  try {
    await fetch(`${CHAT_SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey': CHAT_SUPABASE_KEY,
        'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: parseInt(chatId),
        sender: sender,
        message: text.trim()
      })
    });

    // آپدیت last_message_at
    await fetch(`${CHAT_SUPABASE_URL}/rest/v1/chats?id=eq.${chatId}`, {
      method: 'PATCH',
      headers: {
        'apikey': CHAT_SUPABASE_KEY,
        'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ last_message_at: new Date().toISOString() })
    });

  } catch (err) {
    console.error('خطا در ارسال:', err);
  }
}

// ==== Send from input ====
async function sendFromInput() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  await sendMessage(text, 'visitor');
  loadMessages();
}

// ==== Load Messages ====
async function loadMessages() {
  const chatId = localStorage.getItem('cv_chat_id');
  if (!chatId) return;

  try {
    const res = await fetch(
      `${CHAT_SUPABASE_URL}/rest/v1/messages?chat_id=eq.${chatId}&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': CHAT_SUPABASE_KEY,
          'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`
        }
      }
    );

    const messages = await res.json();
    renderMessages(messages);

  } catch (err) {
    console.error(err);
  }
}

// ==== Render Messages ====
function renderMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (!messages || messages.length === 0) {
    container.innerHTML = '<div class="chat-empty">هنوز پیامی نیست. اولین پیام رو بفرست! 💬</div>';
    return;
  }

  container.innerHTML = messages.map(m => {
    const isMine = m.sender === 'visitor';
    return `
      <div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">
        <div class="chat-text">${escapeHtml(m.message)}</div>
        <div class="chat-time">${formatTime(m.created_at)}</div>
      </div>
    `;
  }).join('');

  // اسکرول به آخر
  container.scrollTop = container.scrollHeight;
}

// ==== Subscribe Realtime ====
function subscribeToMessages() {
  if (chatRealtimeChannel) return;

  const chatId = localStorage.getItem('cv_chat_id');
  if (!chatId) return;

  chatRealtimeChannel = supabase
    .createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_KEY)
    .channel('messages-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => {
        loadMessages();
      }
    )
    .subscribe();
}

// ==== Helpers ====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(iso) {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ==== Toggle Chat Window ====
function toggleChatWindow() {
  const win = document.getElementById('chatWindow');
  if (!win) return;
  win.classList.toggle('open');
  if (win.classList.contains('open')) {
    initChat();
    setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
  }
}

// ==== Send with Enter ====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target && e.target.id === 'chatInput') {
    sendFromInput();
  }
});
