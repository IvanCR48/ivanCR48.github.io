/**
 * Y2K / Frutiger Aero Portfolio Scripts
 * Created for Iván Ismael Cardozo (@ismaelUML)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let soundEnabled = true;
  let isPlayingMusic = false;
  let currentTrackIndex = 0;
  let audioContext = null;
  let synthInterval = null;
  let currentWallpaper = 0;

  const wallpapers = [
    'assets/wallpaper.jpg',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80', // Aesthetic nature
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80'  // Cyber neon
  ];

  // --- Elements ---
  const windowEl = document.getElementById('messenger-window');
  const titlebar = document.getElementById('window-titlebar');
  const btnMinimize = document.getElementById('btn-minimize');
  const btnMaximize = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');
  const taskbarAppBtn = document.getElementById('taskbar-app-btn');
  const iconPortfolio = document.getElementById('icon-portfolio');
  const trayTime = document.getElementById('tray-time');
  const toastEl = document.getElementById('retro-toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  // Menubar & Dropdowns
  const menuButtons = document.querySelectorAll('.menu-item-btn');
  const dropdownMenus = document.querySelectorAll('.dropdown-menu');

  // Tabs & Views
  const tabButtons = document.querySelectorAll('.tab-btn');
  const dbContentArea = document.getElementById('db-content-area');

  // Audio elements
  const track1Row = document.getElementById('track-1');
  const track2Row = document.getElementById('track-2');
  const trackRows = [track1Row, track2Row];
  const btnRecentPlay = document.getElementById('btn-recent-play');
  const btnRecommend = document.getElementById('btn-recommend');

  // Chat elements
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatMessagesBox = document.getElementById('chat-messages-box');

  // Other buttons
  const btnAddFriend = document.getElementById('btn-add-friend');
  const btnSearchFriend = document.getElementById('btn-search-friend');
  const starBadge = document.getElementById('star-badge');
  const quickSearch = document.getElementById('quick-search');
  const btnSearchGo = document.getElementById('btn-search-go');
  const statusbarDoneBtn = document.getElementById('statusbar-done-btn');

  // --- Sound Effects using Web Audio API ---
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playClickSound() {
    if (!soundEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.06);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playNotificationChime() {
    if (!soundEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const now = audioContext.currentTime;
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // MSN messenger style ding
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc1.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      osc2.frequency.setValueAtTime(523.25 / 2, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioContext.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } catch (e) {}
  }

  // Synthesized City Pop Nostalgic Chords (8-bit style chiptune player)
  const cityPopMelodies = [
    // Track 0: Toshiki Kadomatsu - Secret Lover synth chords
    [
      { f: 329.63, d: 0.25 }, { f: 392.00, d: 0.25 }, { f: 493.88, d: 0.4 },
      { f: 440.00, d: 0.3 }, { f: 392.00, d: 0.2 }, { f: 329.63, d: 0.4 },
      { f: 293.66, d: 0.25 }, { f: 349.23, d: 0.25 }, { f: 440.00, d: 0.4 },
      { f: 392.00, d: 0.3 }, { f: 329.63, d: 0.5 }
    ],
    // Track 1: Tatsuro Yamashita - Sparkle / Kokoro groove
    [
      { f: 440.00, d: 0.2 }, { f: 493.88, d: 0.2 }, { f: 554.37, d: 0.3 },
      { f: 659.25, d: 0.4 }, { f: 554.37, d: 0.2 }, { f: 493.88, d: 0.3 },
      { f: 440.00, d: 0.2 }, { f: 369.99, d: 0.4 }, { f: 440.00, d: 0.6 }
    ]
  ];

  let currentNoteIndex = 0;

  function playSynthNote(freq, duration) {
    if (!soundEnabled || !isPlayingMusic) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = currentTrackIndex === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function startMusicPlayback(trackIndex) {
    initAudioContext();
    isPlayingMusic = true;
    currentTrackIndex = trackIndex;
    currentNoteIndex = 0;

    trackRows.forEach((row, idx) => {
      if (idx === trackIndex) {
        row.classList.add('playing');
        row.querySelector('.play-circle-btn').textContent = '⏸';
      } else {
        row.classList.remove('playing');
        row.querySelector('.play-circle-btn').textContent = '▶';
      }
    });

    if (synthInterval) clearInterval(synthInterval);

    const melody = cityPopMelodies[currentTrackIndex];
    synthInterval = setInterval(() => {
      if (!isPlayingMusic) return;
      const note = melody[currentNoteIndex];
      playSynthNote(note.f, note.d);
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }, 380);

    const trackName = trackIndex === 0 ? '角松敏生 - Secret Lover' : '山下達郎 - Sparkle';
    showToast(`🎵 Reproduciendo: ${trackName}`);
  }

  function stopMusicPlayback() {
    isPlayingMusic = false;
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    trackRows.forEach(row => {
      row.classList.remove('playing');
      row.querySelector('.play-circle-btn').textContent = '▶';
    });
    showToast('⏸ Música pausada');
  }

  function toggleMusicPlayback(trackIndex) {
    if (isPlayingMusic && currentTrackIndex === trackIndex) {
      stopMusicPlayback();
    } else {
      startMusicPlayback(trackIndex);
    }
  }

  // Track clicks
  trackRows.forEach((row, idx) => {
    row.addEventListener('click', () => {
      playClickSound();
      toggleMusicPlayback(idx);
    });
  });

  btnRecentPlay.addEventListener('click', () => {
    playClickSound();
    btnRecentPlay.classList.add('active');
    btnRecommend.classList.remove('active');
    toggleMusicPlayback(0);
  });

  btnRecommend.addEventListener('click', () => {
    playClickSound();
    btnRecommend.classList.add('active');
    btnRecentPlay.classList.remove('active');
    toggleMusicPlayback(1);
  });

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(message, icon = 'ℹ️') {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toastIcon.textContent = icon;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // --- Clock in Taskbar ---
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    trayTime.textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- Window Control Actions ---
  btnMinimize.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    windowEl.classList.add('minimized');
    taskbarAppBtn.classList.remove('active');
    showToast('Ventana minimizada en la barra de tareas.');
  });

  // Window Maximize / Restore logic
  let preMaxStyles = null;

  function toggleMaximize() {
    playClickSound();
    const isMax = windowEl.classList.toggle('maximized');
    if (isMax) {
      preMaxStyles = {
        position: windowEl.style.position,
        left: windowEl.style.left,
        top: windowEl.style.top,
        margin: windowEl.style.margin,
        transform: windowEl.style.transform
      };
      windowEl.style.position = '';
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.margin = '';
      btnMaximize.textContent = '❐';
      btnMaximize.title = 'Restore Window';
    } else {
      if (preMaxStyles) {
        windowEl.style.position = preMaxStyles.position;
        windowEl.style.left = preMaxStyles.left;
        windowEl.style.top = preMaxStyles.top;
        windowEl.style.margin = preMaxStyles.margin;
      }
      btnMaximize.textContent = '🗖';
      btnMaximize.title = 'Maximize Window';
    }
  }

  btnMaximize.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMaximize();
  });

  titlebar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.titlebar-controls')) return;
    toggleMaximize();
  });

  btnClose.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    windowEl.classList.add('minimized');
    taskbarAppBtn.classList.remove('active');
    showToast('小蓝道 se ha minimizado al tray. Haz clic en el icono del escritorio para restaurar.');
  });

  taskbarAppBtn.addEventListener('click', () => {
    playClickSound();
    if (windowEl.classList.contains('minimized')) {
      windowEl.classList.remove('minimized');
      taskbarAppBtn.classList.add('active');
    } else {
      windowEl.classList.add('minimized');
      taskbarAppBtn.classList.remove('active');
    }
  });

  iconPortfolio.addEventListener('click', () => {
    playClickSound();
    windowEl.classList.remove('minimized');
    taskbarAppBtn.classList.add('active');
  });

  document.getElementById('icon-mycomputer').addEventListener('click', () => {
    playClickSound();
    showToast('Mi PC: Intel Pentium 4 3.0GHz, 512MB RAM, Windows XP SP2');
  });

  document.getElementById('icon-recyclebin').addEventListener('click', () => {
    playClickSound();
    showToast('Papelera de reciclaje: 0 bugs encontrados 🗑️');
  });

  document.getElementById('start-btn').addEventListener('click', () => {
    playClickSound();
    showToast('Menú Inicio: Iván Ismael Cardozo (Developer @Argentina)');
  });

  // --- Simple Window Dragging ---
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.titlebar-controls')) return;
    if (windowEl.classList.contains('maximized')) return;
    isDragging = true;
    const rect = windowEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    windowEl.style.position = 'fixed';
    windowEl.style.left = `${rect.left}px`;
    windowEl.style.top = `${rect.top}px`;
    windowEl.style.margin = '0';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;
    if (newY < 0) newY = 0;
    windowEl.style.left = `${newX}px`;
    windowEl.style.top = `${newY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // --- Menu Bar Dropdowns ---
  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      const parent = btn.closest('.menu-item-wrapper');
      const dropdown = parent.querySelector('.dropdown-menu');
      const isOpen = dropdown.classList.contains('show');

      // Close all
      dropdownMenus.forEach(d => d.classList.remove('show'));
      menuButtons.forEach(b => b.classList.remove('active'));

      if (!isOpen) {
        dropdown.classList.add('show');
        btn.classList.add('active');
      }
    });
  });

  document.addEventListener('click', () => {
    dropdownMenus.forEach(d => d.classList.remove('show'));
    menuButtons.forEach(b => b.classList.remove('active'));
  });

  // Menu Dropdown Item Actions
  const soundToggleBtn = document.getElementById('menu-sound-toggle');
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.querySelector('kbd').textContent = soundEnabled ? 'ON' : 'OFF';
    document.getElementById('tray-sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    showToast(`Sonido: ${soundEnabled ? 'Activado' : 'Silenciado'}`);
  });

  document.getElementById('menu-save-profile').addEventListener('click', () => {
    showToast('Presiona Ctrl + D en tu navegador para guardar en favoritos ⭐');
  });

  document.getElementById('menu-exit').addEventListener('click', () => {
    windowEl.classList.add('minimized');
    taskbarAppBtn.classList.remove('active');
  });

  document.getElementById('menu-add-friend-action').addEventListener('click', () => {
    copyGitHubLink();
  });

  document.getElementById('menu-quick-shout').addEventListener('click', () => {
    chatInput.focus();
    chatInput.scrollIntoView({ behavior: 'smooth' });
    showToast('Escribe tu mensaje en el chat!');
  });

  document.getElementById('menu-play-music').addEventListener('click', () => {
    toggleMusicPlayback(currentTrackIndex);
  });

  document.getElementById('menu-next-track').addEventListener('click', () => {
    const next = (currentTrackIndex + 1) % 2;
    startMusicPlayback(next);
  });

  document.getElementById('menu-clear-chat').addEventListener('click', () => {
    localStorage.removeItem('y2k_guestbook_msgs');
    chatMessagesBox.innerHTML = `
      <div class="chat-bubble-row">
        <img src="pfp/2967b03acaab18c50c1518d110d6b7a1.gif" class="chat-bubble-avatar">
        <div class="chat-bubble-content">
          <div class="chat-bubble-meta">
            <span>ismaelUML</span>
            <span class="chat-bubble-time">18:00</span>
          </div>
          <div class="chat-bubble-text">
            <span class="kaomoji">٩( 'ω' )و</span>
            <span>Chat reiniciado. ¡Deja tu mensaje aquí!</span>
          </div>
        </div>
      </div>
    `;
    showToast('🧹 Mensajes locales eliminados.');
  });

  document.getElementById('menu-toggle-wallpaper').addEventListener('click', () => {
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
    document.body.style.backgroundImage = `url('${wallpapers[currentWallpaper]}')`;
    showToast(`🖼️ Fondo cambiado (#${currentWallpaper + 1})`);
  });

  document.getElementById('menu-info-dialog').addEventListener('click', () => {
    showToast('小蓝道 v2.0 - Creado para Iván Ismael Cardozo (@ismaelUML)');
  });

  // --- Tab Switching Logic ---
  const tabContentCache = {
    'tab-notes': `
      <div class="db-bio-text">
        <strong>Iván Ismael Cardozo</strong> — Developer based in Argentina 🇦🇷.
        Specialized in web development, QML desktop interfaces, system utilities, and nostalgic Y2K/Frutiger Aero aesthetic craft.
      </div>
      <div class="linked-webs-section">
        <div class="linked-webs-title">
          <span>🌐</span>
          <span>@linked webs...</span>
        </div>
        <div class="tree-links">
          <a href="https://github.com/ismaelUML" target="_blank" rel="noopener" class="tree-link-item">
            <span class="tree-branch">↳</span>
            <span>github.com/ismaelUML</span>
          </a>
          <a href="https://github.com/ismaelUML/Pocket-AntiGravityIDE" target="_blank" rel="noopener" class="tree-link-item">
            <span class="tree-branch">↳</span>
            <span>Pocket-AntiGravityIDE</span>
          </a>
          <a href="https://github.com/ismaelUML/RathonWare" target="_blank" rel="noopener" class="tree-link-item">
            <span class="tree-branch">↳</span>
            <span>RathonWare (QML)</span>
          </a>
          <a href="https://github.com/ismaelUML/RobosMDP-Remix" target="_blank" rel="noopener" class="tree-link-item">
            <span class="tree-branch">↳</span>
            <span>RobosMDP-Remix (JS)</span>
          </a>
          <a href="https://github.com/ismaelUML/AdvancedMonitor" target="_blank" rel="noopener" class="tree-link-item">
            <span class="tree-branch">↳</span>
            <span>AdvancedMonitor & ERP</span>
          </a>
        </div>
      </div>
    `,
    'tab-chat': `
      <div class="db-bio-text">
        <strong>Direct Chat & Status</strong>:
        <br>Actualmente disponible para proyectos de desarrollo, herramientas y colaboración open source.
      </div>
      <div style="font-size: 11px; color: #164885; margin-top: 6px;">
        💡 Puedes enviar mensajes en tiempo real en la caja de chat a la derecha 👉
      </div>
      <div style="margin-top: 8px;">
        <button class="retro-btn" style="width: 100%; height: 26px;" id="tab-chat-focus-btn">💬 Ir a la caja de mensajes</button>
      </div>
    `,
    'tab-info': `
      <div class="db-bio-text">
        <strong>Skills & Tecnologías</strong>:
      </div>
      <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
        <div>⚡ <strong>Lenguajes:</strong> JavaScript, TypeScript, Python, QML, C++, HTML5, CSS3</div>
        <div>🛠️ <strong>Herramientas:</strong> Git, GitHub, Linux, VS Code, Antigravity</div>
        <div>🌐 <strong>Enfoque:</strong> Frontend Aesthetics, Desktop UI, Web Apps</div>
        <div>📍 <strong>Ubicación:</strong> Argentina (UTC-3)</div>
      </div>
    `,
    'tab-media': `
      <div class="db-bio-text">
        <strong>Media & Proyectos Destacados</strong>:
      </div>
      <div style="font-size: 11px; display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
        <div style="padding: 4px; background: #eef5fc; border: 1px solid #c2d8ee; border-radius: 2px;">
          🎮 <strong>RobosMDP-Remix</strong><br>
          <span style="color: #6481a1;">Remix interactivo desarrollado en JavaScript.</span>
        </div>
        <div style="padding: 4px; background: #eef5fc; border: 1px solid #c2d8ee; border-radius: 2px;">
          💻 <strong>Pocket-AntiGravityIDE</strong><br>
          <span style="color: #6481a1;">Configuraciones y utilidades de entorno de desarrollo.</span>
        </div>
      </div>
    `
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      if (tabContentCache[tabId]) {
        dbContentArea.innerHTML = tabContentCache[tabId];
        const focusBtn = document.getElementById('tab-chat-focus-btn');
        if (focusBtn) {
          focusBtn.addEventListener('click', () => chatInput.focus());
        }
      }
    });
  });

  // Vertical Toolbar actions
  document.getElementById('tool-globe').addEventListener('click', () => {
    playClickSound();
    document.querySelector('[data-tab="tab-notes"]').click();
  });
  document.getElementById('tool-ipod').addEventListener('click', () => {
    playClickSound();
    toggleMusicPlayback(currentTrackIndex);
  });
  document.getElementById('tool-calendar').addEventListener('click', () => {
    playClickSound();
    document.querySelector('[data-tab="tab-info"]').click();
    showToast('📅 Actividad de GitHub: 10 repositorios públicos activos.');
  });
  document.getElementById('tool-trash').addEventListener('click', () => {
    playClickSound();
    showToast('Papelera vacía: ¡Código limpio y sin bugs!');
  });

  // --- Add Friend (Copy link) ---
  function copyGitHubLink() {
    playNotificationChime();
    const url = 'https://github.com/ismaelUML';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('⭐ ¡Enlace copiado! Sígueme en GitHub @ismaelUML');
      }).catch(() => {
        window.open(url, '_blank');
      });
    } else {
      window.open(url, '_blank');
    }
  }

  btnAddFriend.addEventListener('click', copyGitHubLink);

  btnSearchFriend.addEventListener('click', () => {
    playClickSound();
    quickSearch.focus();
    showToast('Busca repositorios o tecnologías en la barra superior.');
  });

  // Star badge toggle
  let isStarred = false;
  starBadge.addEventListener('click', () => {
    playClickSound();
    isStarred = !isStarred;
    starBadge.textContent = isStarred ? '★' : '☆';
    starBadge.style.color = isStarred ? '#ff9900' : 'var(--xp-star-gold)';
    showToast(isStarred ? '★ ¡Has añadido a Iván a tus favoritos!' : '☆ Favorito removido.');
  });

  // --- Interactive Guestbook / Shoutbox with Kaomojis ---
  const kaomojis = [
    "٩( 'ω' )و",
    "(*^▽^*)",
    "(◕‿◕) ✨",
    "(づ｡◕‿‿◕｡)づ",
    "(-ω-、)",
    "(｡♥‿♥｡)",
    "ヾ(＾∇＾)"
  ];

  function loadSavedMessages() {
    const saved = localStorage.getItem('y2k_guestbook_msgs');
    if (saved) {
      try {
        const msgs = JSON.parse(saved);
        msgs.forEach(msg => appendMessageDOM(msg.name, msg.text, msg.time, msg.kaomoji, false));
      } catch (e) {}
    }
  }

  function appendMessageDOM(name, text, time, kaomoji, save = true) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble-row';
    bubble.innerHTML = `
      <img src="pfp/2967b03acaab18c50c1518d110d6b7a1.gif" class="chat-bubble-avatar">
      <div class="chat-bubble-content">
        <div class="chat-bubble-meta">
          <span>${name}</span>
          <span class="chat-bubble-time">${time}</span>
        </div>
        <div class="chat-bubble-text">
          <span class="kaomoji">${kaomoji}</span>
          <span>${text}</span>
        </div>
      </div>
    `;
    chatMessagesBox.appendChild(bubble);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;

    if (save) {
      let msgs = [];
      try {
        msgs = JSON.parse(localStorage.getItem('y2k_guestbook_msgs') || '[]');
      } catch (e) {
        msgs = [];
      }
      msgs.push({ name, text, time, kaomoji });
      localStorage.setItem('y2k_guestbook_msgs', JSON.stringify(msgs));
    }
  }

  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    playNotificationChime();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randomKaomoji = kaomojis[Math.floor(Math.random() * kaomojis.length)];

    appendMessageDOM('Invitado', text, timeStr, randomKaomoji, true);
    chatInput.value = '';
    showToast('💬 Mensaje enviado al shoutbox!');
  }

  chatSendBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });

  loadSavedMessages();

  // --- Category Filter & Search ---
  const categoryFilter = document.getElementById('category-filter');
  categoryFilter.addEventListener('change', () => {
    playClickSound();
    const val = categoryFilter.value;
    if (val === 'bio') {
      document.querySelector('[data-tab="tab-notes"]').click();
    } else if (val === 'projects') {
      document.querySelector('[data-tab="tab-media"]').click();
    } else if (val === 'shoutbox') {
      document.querySelector('[data-tab="tab-chat"]').click();
    } else if (val === 'music') {
      toggleMusicPlayback(0);
    } else {
      document.querySelector('[data-tab="tab-notes"]').click();
    }
  });

  function performSearch() {
    const query = quickSearch.value.trim().toLowerCase();
    if (!query) return;
    playClickSound();

    if (query.includes('music') || query.includes('song') || query.includes('audio')) {
      toggleMusicPlayback(0);
      showToast('🎵 Reproductor activado.');
    } else if (query.includes('repo') || query.includes('project') || query.includes('qml') || query.includes('js')) {
      document.querySelector('[data-tab="tab-media"]').click();
      showToast('📂 Mostrando repositorios de Iván.');
    } else {
      showToast(`Búsqueda: "${query}" - Navega en las pestañas.`);
    }
  }

  btnSearchGo.addEventListener('click', performSearch);
  quickSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  statusbarDoneBtn.addEventListener('click', () => {
    playClickSound();
    showToast('Estado: Listo / Ready (小蓝道 v2.0)');
  });

  // Status badges tooltips
  document.getElementById('badge-pc').addEventListener('click', () => {
    showToast('PC: Online en Argentina 🇦🇷');
  });
  document.getElementById('badge-chat').addEventListener('click', () => {
    showToast('Estado: Programando proyectos web y sistemas');
  });
  document.getElementById('badge-globe').addEventListener('click', () => {
    showToast('Ubicación: Argentina (UTC-3)');
  });
});
