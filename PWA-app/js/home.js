// Home page logic: load shortcuts and greeting
// checking checkin
async function foo() {
  return true;
}
async function loadShortcuts() {
  try {
    const response = await fetch('/data/shortcuts.json');
    const data = await response.json();
    const grid = document.getElementById('shortcut-grid');
    
    if (!grid) return;
    
    grid.innerHTML = data.shortcuts.map(shortcut => `
      <button class="shortcut-card" data-section="${shortcut.section}" style="background-color: ${shortcut.color};">
        <div class="shortcut-icon">${shortcut.icon}</div>
        <div class="shortcut-label">${shortcut.name}</div>
      </button>
    `).join('');
    
    // Reattach event listeners after populating
    if (typeof initializeNavigation === 'function') {
      initializeNavigation();
    }

    setStatusMessage(`Loaded ${data.shortcuts.length} shortcuts`);
  } catch (error) {
    console.error('Error loading shortcuts:', error);
    setStatusMessage('Failed to load shortcuts');
  }
}

async function loadGreeting() {
  try {
    const response = await fetch('/data/user.json');
    const userData = await response.json();
    const greetingElement = document.getElementById('greeting-text');
    
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else if (hour >= 18) {
      greeting = 'Good evening';
    }
    
    greetingElement.textContent = `${greeting}, ${userData.name}`;
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

function initializeMoodButtons() {
  const moodButtons = document.querySelectorAll('.mood-button');
  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      console.log(`User selected mood: ${mood}`);
      // Placeholder backend call
      sendMood(mood).catch(err => console.warn('sendMood failed (placeholder):', err));
      
      // Visual feedback
      moodButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      
      // Show message
      const dynamicContent = document.getElementById('dynamic-content');
      if (dynamicContent) {
        dynamicContent.innerHTML = `<p class="dynamic-placeholder">Thank you for sharing. You're feeling ${mood} today.</p>`;
      }
    });
  });
}

// Placeholder: send mood to backend (to be replaced with real API)
async function sendMood(mood) {
  // Example: await fetch('/api/senior/{id}/mood', { method: 'POST', body: JSON.stringify({ mood }) })
  return Promise.resolve({ status: 'ok', mood });
}

function initializeTalkToMe() {
  const sendBtn = document.getElementById('talk-send');
  const inputEl = document.getElementById('talk-input');
  const responseEl = document.getElementById('talk-response');

  if (!sendBtn || !inputEl || !responseEl) return;

  const sendHandler = async () => {
    const text = (inputEl.value || '').trim();
    if (!text) return;
    try {
      const reply = await sendTalkToMe(text);
      responseEl.innerHTML = `<div class="talk-bubble">${reply}</div>`;
      setStatusMessage('Message sent');
    } catch (err) {
      console.warn('sendTalkToMe failed (placeholder):', err);
      responseEl.textContent = 'Sorry, there was a problem sending your message.';
      setStatusMessage('Failed to send message');
    }
  };

  sendBtn.addEventListener('click', sendHandler);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      sendHandler();
    }
  });
}

// Placeholder: send freeform text to backend (to be replaced with real API)
async function sendTalkToMe(text) {
  // Mock behavior: echo back with a clarification prompt
  // Example real call: await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ text }) })
  return Promise.resolve(`do you mean: "${text}"`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadShortcuts();
  loadGreeting();
  initializeMoodButtons();
  initializeTalkToMe();
});

// Helper: set status/debug messages under the grid
function setStatusMessage(msg) {
  const el = document.getElementById('status-content');
  if (!el) return;
  el.innerHTML = `<p class="status-placeholder">${msg}</p>`;
}
