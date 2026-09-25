// ==========================================
// Capitan Vexor - Chat System (v3)
// ==========================================

const CHAT_SUPABASE_URL = 'https://pvghoflyhkppgpralypc.supabase.co';
const CHAT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2hvZmx5aGtwcGdwcmFseXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjcwODIsImV4cCI6MjEwNTkwMzA4Mn0.yaYfCSXUegLwB3AQDuj733xyCZK49J95W2Gey6EAiWw';

let chatRealtimeChannel = null;

// ==== Init ====
async function initChat() {
  const chatId = localStorage.getItem('cv_chat_id');
  const visitorName = localStorage.getItem('cv_chat_name');

  if (chatId && visitorName) {
    // چک کن چت هنوز توی دیتابیس هست یا نه
    try {
      const check = await fetch(`${CHAT_SUPABASE_URL}/rest/v1/chats?id=eq.${chatId}&select=id`, {
        headers: {
          'apikey': CHAT_SUPABASE_KEY,
          'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`
        }
      });
      const data = await check.json();

      if (data && data.length > 0) {
        // چت وجود داره
        document.getElementById('chatNameForm').style.display = 'none';
        document.getElementById('chatMessages').style.display = 'flex';
        document.getElementById('chatInputArea').style.display = 'flex';
        loadMessages();
        subscribeToMessages();
        return;
      } else {
        // چت حذف شده — localStorage رو پاک کن
        localStorage.removeItem('cv_chat_id');
        localStorage.removeItem('cv_chat_name');
        localStorage.removeItem('cv_chat_session');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // فرم ثبت نام نمایش داده بشه
  document.getElementById('chatNameForm').style.display = 'flex';
  document.getElementById('chatMessages').style.display = 'none';
  document.getElementById('chatInputArea').style.display = 'none';
}

// ==== Start Chat ====
async function startChat() {
  const nameInput = document.getElementById('visitorNameInput');
  const phoneInput = document.getElementById('visitorPhoneInput');
  const name = nameInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!name) {
    alert('لطفاً اسمت رو بنویس!');
    return;
  }

  const sessionId = 'cv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  try {
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
        status: 'open',
        unread_count: 0
      })
    });

    if (!res.ok) throw new Error('خطا در ساخت چت');

    const data = await res.json();
    const chatId = data[0].id;

    localStorage.setItem('cv_chat_id', chatId);
    localStorage.setItem('cv_chat_name', name);
    localStorage.setItem('cv_chat_session', sessionId);

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
  if (!text || !text.trim()) return false;
  const chatId = localStorage.getItem('cv_chat_id');
  if (!chatId) return false;

  try {
    const res = await fetch(`${CHAT_SUPABASE_URL}/rest/v1/messages`, {
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

    if (!res.ok) {
      console.error('خطا در ذخیره پیام:', await res.text());
      return false;
    }

    await fetch(`${CHAT_SUPABASE_URL}/rest/v1/chats?id=eq.${chatId}`, {
      method: 'PATCH',
      headers: {
        'apikey': CHAT_SUPABASE_KEY,
        'Authorization': `Bearer ${CHAT_SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ last_message_at: new Date().toISOString() })
    });

    return true;
  } catch (err) {
    console.error('خطا در ارسال:', err);
    return false;
  }
}

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
  } catch (err) { console.error(err); }
}

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

  container.scrollTop = container.scrollHeight;
}

// ==== Realtime ====
function subscribeToMessages() {
  if (chatRealtimeChannel) return;
  const chatId = localStorage.getItem('cv_chat_id');
  if (!chatId) return;

  chatRealtimeChannel = supabase
    .createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_KEY)
    .channel('messages-changes-' + chatId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      () => loadMessages()
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
  return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

// ==== Toggle ====
function toggleChatWindow() {
  const win = document.getElementById('chatWindow');
  if (!win) return;
  win.classList.toggle('open');
  if (win.classList.contains('open')) {
    initChat();
    setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
  }
}

// ==== Enter ====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target && e.target.id === 'chatInput') {
    sendFromInput();
  }
});
