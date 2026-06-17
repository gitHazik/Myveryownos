'use strict';


const toastContainer = (() => {
  const c = document.createElement('div');
  c.id = 'toast-container';
  document.body.appendChild(c);
  return c;
})();

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}


const bootLines = [
  '[ OK ] Initialising kernel modules…',
  '[ OK ] Mounting virtual filesystem…',
  '[ OK ] Loading glass compositor…',
  '[ OK ] Starting window manager…',
  '[ OK ] Spawning desktop environment…',
  '[ OK ] Loading user profile…',
  '[ OK ] Warming up apps…',
  '[ OK ] All systems nominal. Welcome.',
];

function runBoot() {
  const log   = document.getElementById('boot-log');
  const bar   = document.getElementById('boot-bar');
  let i = 0;

  const tick = () => {
    if (i < bootLines.length) {
      const line = document.createElement('div');
      line.textContent = bootLines[i];
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      bar.style.width = ((i + 1) / bootLines.length * 100) + '%';
      i++;
      setTimeout(tick, 290 + Math.random() * 180);
    } else {
      setTimeout(launchDesktop, 600);
    }
  };
  tick();
}

function launchDesktop() {
  const boot    = document.getElementById('boot-screen');
  const desktop = document.getElementById('desktop');
  boot.style.transition = 'opacity .6s';
  boot.style.opacity = '0';
  setTimeout(() => {
    boot.classList.add('hidden');
    desktop.classList.remove('hidden');
    initDesktop();
  }, 620);
}


function initDesktop() {
  initClock();
  initTaskbar();
  initWindowManager();
  initDesktopIcons();
  initNotepad();
  initFileExplorer();
  initBrowser();
  initSettings();
  initContextMenu();
  showToast('Welcome to myVeryOwnOS 👋');
}

let use24h = true;

function initClock() {
  const updateClock = () => {
    const now  = new Date();
    let   h    = now.getHours();
    const m    = String(now.getMinutes()).padStart(2, '0');
    let   ampm = '';
    if (!use24h) {
      ampm = h >= 12 ? ' PM' : ' AM';
      h = h % 12 || 12;
    }
    const timeStr = String(h).padStart(2, '0') + ':' + m + ampm;
    const dateStr = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    document.getElementById('clock-time').textContent = timeStr;
    document.getElementById('clock-date').textContent = dateStr;
    document.getElementById('tb-clock').textContent   = timeStr;
  };
  updateClock();
  setInterval(updateClock, 5000);
}


const APPS = [
  { id: 'notepad',  label: 'Notepad',  icon: '📝' },
  { id: 'files',    label: 'Files',    icon: '📁' },
  { id: 'browser',  label: 'Browser',  icon: '🌐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function initTaskbar() {
  const container = document.getElementById('taskbar-apps');
  APPS.forEach(app => {
    const btn = document.createElement('div');
    btn.className = 'tb-app-btn';
    btn.id = 'tb-' + app.id;
    btn.innerHTML = `<span class="tb-app-btn-icon">${app.icon}</span>${app.label}`;
    btn.addEventListener('click', () => toggleApp(app.id));
    container.appendChild(btn);
  });
}



let zTop = 200;

function initWindowManager() {
  document.querySelectorAll('.window').forEach(win => {
    const tb = win.querySelector('.win-titlebar');
    makeDraggable(win, tb);
    makeResizable(win);

    win.addEventListener('mousedown', () => bringToFront(win));

    const cls = win.querySelector('.wbtn.cls');
    const min = win.querySelector('.wbtn.min');
    const max = win.querySelector('.wbtn.max');
    const appId = win.dataset.app;

    if (cls) cls.addEventListener('click', e => { e.stopPropagation(); closeApp(appId); });
    if (min) min.addEventListener('click', e => { e.stopPropagation(); minimiseApp(appId); });
    if (max) max.addEventListener('click', e => { e.stopPropagation(); toggleMaximise(win); });
  });
}

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  win.style.zIndex = ++zTop;
  win.classList.add('focused');
}

function openApp(appId) {
  const win = document.getElementById('win-' + appId);
  if (!win) return;
  win.classList.remove('hidden', 'minimised');
  win.style.display = 'flex';
  bringToFront(win);
  setTaskbarActive(appId, true);

  // Default position (stagger)
  if (!win._positioned) {
    const idx = APPS.findIndex(a => a.id === appId);
    win.style.left = (160 + idx * 28) + 'px';
    win.style.top  = (60  + idx * 28) + 'px';
    win._positioned = true;
  }
}

function closeApp(appId) {
  const win = document.getElementById('win-' + appId);
  if (!win) return;
  win.classList.add('hidden');
  setTaskbarActive(appId, false);
}

function minimiseApp(appId) {
  const win = document.getElementById('win-' + appId);
  if (!win) return;
  win.classList.add('minimised');
  setTaskbarActive(appId, false);
}

function toggleApp(appId) {
  const win = document.getElementById('win-' + appId);
  if (!win) return;
  if (win.classList.contains('hidden') || win.classList.contains('minimised')) {
    openApp(appId);
  } else if (win.classList.contains('focused')) {
    minimiseApp(appId);
  } else {
    bringToFront(win);
  }
}

function setTaskbarActive(appId, active) {
  const btn = document.getElementById('tb-' + appId);
  if (btn) btn.classList.toggle('open', active);
}

function toggleMaximise(win) {
  if (win.classList.contains('maximised')) {
    win.classList.remove('maximised');
    // restore saved dims
    if (win._saved) {
      Object.assign(win.style, win._saved);
      delete win._saved;
    }
  } else {
    win._saved = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
    win.classList.add('maximised');
  }
}


function initDesktopIcons() {
  document.querySelectorAll('.desk-icon').forEach(icon => {
    let clicks = 0;
    icon.addEventListener('click', () => {
      clicks++;
      if (clicks === 2) { openApp(icon.dataset.app); clicks = 0; }
      setTimeout(() => { clicks = 0; }, 400);
    });
  });
}


function makeDraggable(win, handle) {
  let ox, oy;

  handle.addEventListener('mousedown', e => {
    if (win.classList.contains('maximised')) return;
    e.preventDefault();
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;

    const onMove = e => {
      const nx = e.clientX - ox;
      const ny = Math.max(0, e.clientY - oy);
      const maxX = window.innerWidth  - win.offsetWidth;
      const maxY = window.innerHeight - 52 - win.offsetHeight;
      win.style.left = Math.min(Math.max(nx, -win.offsetWidth + 60), maxX + win.offsetWidth - 60) + 'px';
      win.style.top  = Math.min(Math.max(ny, 0), maxY) + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });


  handle.addEventListener('touchstart', e => {
    if (win.classList.contains('maximised')) return;
    const t = e.touches[0];
    ox = t.clientX - win.offsetLeft;
    oy = t.clientY - win.offsetTop;
  }, { passive: true });
  handle.addEventListener('touchmove', e => {
    const t = e.touches[0];
    win.style.left = (t.clientX - ox) + 'px';
    win.style.top  = Math.max(0, t.clientY - oy) + 'px';
  }, { passive: true });
}


function makeResizable(win) {
  const handle = document.createElement('div');
  handle.className = 'win-resize';
  handle.textContent = '◢';
  win.appendChild(handle);

  let sx, sy, sw, sh;
  handle.addEventListener('mousedown', e => {
    if (win.classList.contains('maximised')) return;
    e.preventDefault(); e.stopPropagation();
    sx = e.clientX; sy = e.clientY;
    sw = win.offsetWidth; sh = win.offsetHeight;

    const onMove = e => {
      win.style.width  = Math.max(sw + e.clientX - sx, 320) + 'px';
      win.style.height = Math.max(sh + e.clientY - sy, 200) + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

function initNotepad() {
  const area    = document.getElementById('notepad-area');
  const stat    = document.getElementById('np-stat');
  const fontSel = document.getElementById('np-font');
  const sizeSel = document.getElementById('np-size');
  const fileIn  = document.getElementById('np-file-input');

  const updateStat = () => {
    const chars = area.value.length;
    const lines = area.value.split('\n').length;
    stat.textContent = `${chars} char${chars !== 1 ? 's' : ''} · ${lines} line${lines !== 1 ? 's' : ''}`;
  };

  area.addEventListener('input', updateStat);

  fontSel.addEventListener('change', () => {
    const map = { 'Monospace': 'monospace', 'Sans-serif': 'sans-serif', 'Serif': 'serif' };
    area.style.fontFamily = map[fontSel.value] || 'monospace';
  });
  sizeSel.addEventListener('change', () => {
    area.style.fontSize = sizeSel.value + 'px';
  });

  document.getElementById('np-new').addEventListener('click', () => {
    if (area.value && !confirm('Discard current content?')) return;
    area.value = '';
    updateStat();
  });

  document.getElementById('np-save').addEventListener('click', () => {
    const blob = new Blob([area.value], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'note.txt',
    });
    a.click();
    showToast('File saved ✓');
  });

  document.getElementById('np-open').addEventListener('click', () => fileIn.click());

  fileIn.addEventListener('change', () => {
    const file = fileIn.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => { area.value = e.target.result; updateStat(); };
    r.readAsText(file);
    fileIn.value = '';
  });
}


const FS = {
  home:      [
    { name: 'Documents', type: 'dir', path: 'docs'      },
    { name: 'Downloads', type: 'dir', path: 'downloads' },
    { name: 'Pictures',  type: 'dir', path: 'pictures'  },
    { name: 'Music',     type: 'dir', path: 'music'     },
    { name: 'readme.txt', type: 'txt' },
  ],
  docs:      [
    { name: 'resume.pdf',   type: 'pdf'  },
    { name: 'notes.txt',    type: 'txt'  },
    { name: 'budget.xlsx',  type: 'xlsx' },
    { name: 'project.docx', type: 'docx' },
  ],
  downloads: [
    { name: 'installer.dmg',  type: 'bin' },
    { name: 'archive.zip',    type: 'zip' },
    { name: 'photo.jpg',      type: 'img' },
  ],
  pictures:  [
    { name: 'vacation.jpg',   type: 'img' },
    { name: 'portrait.png',   type: 'img' },
    { name: 'screenshot.png', type: 'img' },
  ],
  music: [
    { name: 'track01.mp3', type: 'mp3' },
    { name: 'track02.mp3', type: 'mp3' },
  ],
  trash: [],
};

const FILE_ICONS = {
  dir: '📁', txt: '📄', pdf: '📕', xlsx: '📊',
  docx: '📝', bin: '💾', zip: '🗜️', img: '🖼️',
  mp3: '🎵', default: '📄',
};

function initFileExplorer() {
  let currentPath = 'home';
  const history   = ['home'];
  let histIdx     = 0;

  const main    = document.getElementById('fe-main');
  const pathEl  = document.getElementById('fe-path');

  const render = () => {
    main.innerHTML = '';
    pathEl.textContent = '~/' + (currentPath === 'home' ? '' : currentPath);

    const items = FS[currentPath] || [];
    if (items.length === 0) {
      main.innerHTML = '<div style="color:var(--text-dim);font-size:.82rem;padding:20px;">Empty folder</div>';
      return;
    }
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'fe-item';
      div.innerHTML = `<div class="fe-item-icon">${FILE_ICONS[item.type] || FILE_ICONS.default}</div>
                       <div class="fe-item-name">${item.name}</div>`;
      div.addEventListener('dblclick', () => {
        if (item.type === 'dir' && item.path) {
          history.splice(histIdx + 1);
          history.push(item.path);
          histIdx = history.length - 1;
          currentPath = item.path;
          render();
          updateSidebar(item.path);
        } else {
          showToast(`📄 Opening ${item.name}…`);
        }
      });
      main.appendChild(div);
    });
  };

  const updateSidebar = path => {
    document.querySelectorAll('.fe-sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.path === path);
    });
  };

  document.querySelectorAll('.fe-sidebar-item').forEach(el => {
    el.addEventListener('click', () => {
      const p = el.dataset.path;
      history.splice(histIdx + 1);
      history.push(p);
      histIdx = history.length - 1;
      currentPath = p;
      render();
      updateSidebar(p);
    });
  });

  document.getElementById('fe-back').addEventListener('click', () => {
    if (histIdx > 0) { histIdx--; currentPath = history[histIdx]; render(); updateSidebar(currentPath); }
  });
  document.getElementById('fe-fwd').addEventListener('click', () => {
    if (histIdx < history.length - 1) { histIdx++; currentPath = history[histIdx]; render(); updateSidebar(currentPath); }
  });
  document.getElementById('fe-up').addEventListener('click', () => {
    if (currentPath !== 'home') { currentPath = 'home'; histIdx = 0; render(); updateSidebar('home'); }
  });

  document.getElementById('fe-new-folder').addEventListener('click', () => {
    const name = prompt('Folder name:');
    if (!name) return;
    FS[currentPath] = FS[currentPath] || [];
    FS[currentPath].push({ name, type: 'dir', path: null });
    render();
    showToast('📁 Folder created');
  });
  document.getElementById('fe-new-file').addEventListener('click', () => {
    const name = prompt('File name:');
    if (!name) return;
    FS[currentPath] = FS[currentPath] || [];
    FS[currentPath].push({ name, type: 'txt' });
    render();
    showToast('📄 File created');
  });

  render();
}


function initBrowser() {
  const frame     = document.getElementById('browser-frame');
  const urlInput  = document.getElementById('br-url');
  const tabsEl    = document.getElementById('browser-tabs');

  const tabs = [
    { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  ];
  let activeTab = 0;

  const renderTabs = () => {
    tabsEl.innerHTML = '';
    tabs.forEach((tab, i) => {
      const t = document.createElement('div');
      t.className = 'browser-tab' + (i === activeTab ? ' active' : '');
      t.innerHTML = `<span>${tab.title}</span><span class="tab-close" data-idx="${i}">✕</span>`;
      t.addEventListener('click', e => {
        if (e.target.classList.contains('tab-close')) {
          if (tabs.length === 1) return;
          tabs.splice(i, 1);
          activeTab = Math.min(activeTab, tabs.length - 1);
        } else {
          activeTab = i;
        }
        loadTab();
        renderTabs();
      });
      tabsEl.appendChild(t);
    });
    const add = document.createElement('div');
    add.className = 'browser-tab tab-add';
    add.textContent = '+';
    add.addEventListener('click', () => {
      tabs.push({ title: 'New Tab', url: 'https://www.wikipedia.org' });
      activeTab = tabs.length - 1;
      loadTab();
      renderTabs();
    });
    tabsEl.appendChild(add);
  };

  const loadTab = () => {
    const tab = tabs[activeTab];
    let url = tab.url;
    urlInput.value = url;
    try { frame.src = url; } catch(e) {}
    tabs[activeTab].title = new URL(url).hostname.replace('www.', '') || 'Page';
  };

  const navigate = () => {
    let url = urlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }
    tabs[activeTab].url = url;
    loadTab();
    renderTabs();
  };

  document.getElementById('br-go').addEventListener('click', navigate);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(); });
  document.getElementById('br-reload').addEventListener('click', () => { frame.src = frame.src; });
  document.getElementById('br-back').addEventListener('click', () => { try{ frame.contentWindow.history.back(); }catch(e){} });
  document.getElementById('br-fwd').addEventListener('click',  () => { try{ frame.contentWindow.history.forward(); }catch(e){} });

  frame.addEventListener('load', () => {
    try {
      const title = frame.contentDocument?.title;
      if (title) tabs[activeTab].title = title.slice(0, 22);
      renderTabs();
    } catch(e) {}
  });

  renderTabs();
  loadTab();
}


function initSettings() {
  // Nav tabs
  document.querySelectorAll('.sn-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sn-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('stab-' + item.dataset.tab)?.classList.add('active');
    });
  });

  // Accent colour
  document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      const color = sw.dataset.color;
      document.documentElement.style.setProperty('--accent', color);
      document.documentElement.style.setProperty('--accent-glow', color + '55');
      showToast('Accent updated ✓');
    });
  });

  // Blur
  const blurRange = document.getElementById('blur-range');
  const blurVal   = document.getElementById('blur-val');
  blurRange.addEventListener('input', () => {
    const v = blurRange.value;
    blurVal.textContent = v + 'px';
    document.documentElement.style.setProperty('--glass-blur', v + 'px');
  });

  // Opacity
  const opRange = document.getElementById('opacity-range');
  const opVal   = document.getElementById('opacity-val');
  opRange.addEventListener('input', () => {
    const v = opRange.value;
    opVal.textContent = v + '%';
    const frac = v / 100;
    document.documentElement.style.setProperty('--glass-bg', `rgba(255,255,255,${frac})`);
  });

  // Wallpaper
  document.querySelectorAll('.wp').forEach(wp => {
    wp.addEventListener('click', () => {
      document.querySelectorAll('.wp').forEach(w => w.classList.remove('active'));
      wp.classList.add('active');
      const wpVar = '--wp' + wp.dataset.wp;
      document.documentElement.style.setProperty('--wp-current', `var(${wpVar})`);
      document.getElementById('desktop').style.background = `var(${wpVar})`;
    });
    // preview thumbnail
    wp.style.background = `var(--wp${wp.dataset.wp})`;
  });

  // 24h clock
  document.getElementById('clock24-toggle').addEventListener('change', e => {
    use24h = e.target.checked;
  });

  // Animations
  document.getElementById('anim-toggle').addEventListener('change', e => {
    document.documentElement.style.setProperty(
      '--transition', e.target.checked ? '0.22s cubic-bezier(.4,0,.2,1)' : '0s'
    );
  });
}


function initContextMenu() {
  let menu = null;

  const close = () => { menu?.remove(); menu = null; };

  document.getElementById('desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.closest('.desk-icon')) return;
    e.preventDefault();
    close();

    menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.innerHTML = `
      <div class="ctx-item" data-action="notepad">📝 Open Notepad</div>
      <div class="ctx-item" data-action="files">📁 Open Files</div>
      <div class="ctx-item" data-action="browser">🌐 Open Browser</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" data-action="settings">⚙️ Settings</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" data-action="closeall">✕ Close All Windows</div>
    `;

    const x = Math.min(e.clientX, window.innerWidth  - 190);
    const y = Math.min(e.clientY, window.innerHeight - 160);
    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    document.body.appendChild(menu);

    menu.addEventListener('click', ev => {
      const action = ev.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'closeall') {
        APPS.forEach(a => closeApp(a.id));
      } else {
        openApp(action);
      }
      close();
    });
  });

  document.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

runBoot();