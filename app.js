/* COVAN — frontend prototype. No backend, no real payments. */
document.documentElement.classList.add('js');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const body = document.body;
const app = $('#appOverlay');
const modal = $('#preorderModal');
const toastEl = $('#toast');

const initialLangParam = new URLSearchParams(location.search).get('lang');
let currentLang = (initialLangParam === 'en' || initialLangParam === 'tr')
  ? initialLangParam
  : (localStorage.getItem('covan-lang') || 'tr');
const I18N_EN = window.TR_TO_EN || {};
const I18N_PLACEHOLDERS = window.PLACEHOLDER_EN || {};
const originalText = new WeakMap();
const msg = (tr, en) => (currentLang === 'en' ? en : tr);

let toastTimer;
function toast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function lockScroll() {
  body.style.overflow = 'hidden';
}
function unlockScroll() {
  if (!app.classList.contains('open') && !modal.classList.contains('open')) {
    body.style.overflow = '';
  }
}

/* ---------- header / mobile nav ---------- */
const header = $('#siteHeader');
const navLinks = $('#navLinks');
const menuBtn = $('#menuBtn');

menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('#navLinks a').forEach((a) => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

/* ---------- reveal ---------- */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

/* ---------- app overlay ---------- */
function setView(view) {
  $$('.app-nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $$('.app-view').forEach((v) => v.classList.toggle('active', v.dataset.panelView === view));
  const panelBtn = $('#appPanelBtn');
  if (panelBtn) {
    panelBtn.textContent = view === 'panel'
      ? (currentLang === 'en' ? 'Chat' : 'Sohbet')
      : 'Panel';
  }
}
function setPanel(tab) {
  $$('.panel-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tabPanel === tab));
  $$('.panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === tab));
}
function openApp(tab) {
  app.classList.add('open');
  app.setAttribute('aria-hidden', 'false');
  lockScroll();
  if (tab) {
    setView('panel');
    setPanel(tab);
  } else {
    setView('chat');
  }
  setTimeout(() => $('#chatInput')?.focus(), 200);
}
function closeApp() {
  app.classList.remove('open');
  app.setAttribute('aria-hidden', 'true');
  unlockScroll();
}
$$('[data-open-app]').forEach((btn) => {
  btn.addEventListener('click', () => openApp(btn.dataset.tab));
});
$$('[data-close-app]').forEach((btn) => btn.addEventListener('click', closeApp));
$$('.app-nav button').forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});
$('#appPanelBtn')?.addEventListener('click', () => {
  const active = $('.app-view.active')?.dataset.panelView || 'chat';
  setView(active === 'panel' ? 'chat' : 'panel');
});
$$('.panel-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => setPanel(btn.dataset.tabPanel));
});

/* ---------- rent mode ---------- */
let rentOn = false;
function setRent(on, announce = true) {
  rentOn = on;
  $$('#rentToggle, #rentToggle2').forEach((btn) => {
    btn.classList.toggle('on', on);
    btn.textContent = on
      ? (currentLang === 'en' ? 'Rental mode: on' : 'Kira modu: açık')
      : (currentLang === 'en' ? 'Rental mode: off' : 'Kira modu: kapalı');
  });
  $('#marketSwitch')?.classList.toggle('on', on);
  if (announce) toast(on
    ? msg('Kira modu açık: boşta kalan GPU kiraya çıkacak.', 'Rental mode on: idle GPU capacity will be listed.')
    : msg('Kira modu kapalı.', 'Rental mode off.'));
}
$('#rentToggle')?.addEventListener('click', () => setRent(!rentOn));
$('#rentToggle2')?.addEventListener('click', () => setRent(!rentOn));
$('#marketSwitch')?.addEventListener('click', () => setRent(!rentOn));

/* ---------- chat mock ---------- */
const chat = $('#appChat');
const chatForm = $('#chatForm');
const chatInput = $('#chatInput');

function chatScroll() {
  if (chat) chat.scrollTop = chat.scrollHeight;
}
function addUser(text) {
  const el = document.createElement('div');
  el.className = 'msg user';
  el.textContent = text;
  chat.appendChild(el);
  chatScroll();
}
function addBot(html) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.innerHTML = `<div class="bot-avatar"><svg><use href="#logo"></use></svg></div><div class="bot-text">${html}</div>`;
  chat.appendChild(el);
  chatScroll();
}
function botAnswer(text) {
  const t = text.toLowerCase();
  if (currentLang === 'en') {
    if (t.includes('summary') || t.includes('meeting')) {
      return `<p>I summarized your meeting notes in your box:</p><ol>
        <li>Launch date confirmed for November 12.</li>
        <li>Marketing budget increased by 10%.</li>
        <li>Two people are joining the design team.</li>
        <li>Customer demo will be on Friday.</li>
        <li>Next meeting Monday at 10:00.</li>
      </ol>`;
    }
    if (t.includes('code') || t.includes('python') || t.includes('script')) {
      return `<p>Sure. This is a demo response; the real model runs on your GPU.</p><pre>def hello():\n    return "Covan"</pre>`;
    }
    if (t.includes('rent') || t.includes('earn') || t.includes('money')) {
      return `<p>When rental mode is on, idle GPU capacity is listed at $0.27/hr. At 40% utilization that is about $55/month in rental income, or ~$30 net after $25 upkeep.</p>`;
    }
    if (t.includes('trust') || t.includes('data') || t.includes('encrypt')) {
      return `<p>Your data stays on your encrypted disk. Covan cannot read the content; it only sees metadata, health and billing data. The tenant container is deleted when the job ends.</p>`;
    }
    return `<p>I ran this on your GPU. Responses are simulated in this prototype; in real CovanOS the model runs entirely in your box.</p>`;
  }
  if (t.includes('özet') || t.includes('toplantı')) {
    return `<p>Toplantı notlarını senin kutunda özetledim:</p><ol>
      <li>Lansman tarihi 12 Kasım olarak kesinleşti.</li>
      <li>Pazarlama bütçesi yüzde 10 artırıldı.</li>
      <li>Tasarım ekibine iki kişi katılıyor.</li>
      <li>Müşteri demosu cuma günü yapılacak.</li>
      <li>Sonraki toplantı pazartesi 10:00.</li>
    </ol>`;
  }
  if (t.includes('kod') || t.includes('python') || t.includes('script')) {
    return `<p>Tabii. Bu bir demo yanıtı; gerçek model senin GPU'nda çalışıyor.</p><pre>def merhaba():\n    return "Covan"</pre>`;
  }
  if (t.includes('kira') || t.includes('kazanç') || t.includes('para')) {
    return `<p>Kira modu açıkken boşta kalan GPU saatlik $0,27'den kiraya çıkar. %40 dolulukta aylık ~$55 kira geliri, $25 bakım sonrası ~$30 net kalır.</p>`;
  }
  if (t.includes('güven') || t.includes('veri') || t.includes('şifre')) {
    return `<p>Veri senin şifreli diskinde. Covan içeriği okuyamaz; yalnızca metadata, sağlık ve fatura verisini görür. Kiracı işi bitince konteyner silinir.</p>`;
  }
  return `<p>Bunu senin GPU'nda çalıştırdım. Bu prototipte yanıtlar temsilîdir; gerçek CovanOS'ta model tamamen senin kutunda çalışır.</p>`;
}
if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addUser(text);
    chatInput.value = '';
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(typing);
    chatScroll();
    setTimeout(() => {
      typing.remove();
      addBot(botAnswer(text));
    }, 650);
  });
}

/* ---------- utilization ---------- */
const GPU_PRICE = 399;
const MAINTENANCE = 25;
const HOURLY = 0.27;
const HOURS = 720;
let currentUtil = 40;

function updateUtil(util) {
  currentUtil = util;
  const gross = HOURS * (util / 100) * HOURLY;
  const owner = gross * 0.7;
  const net = owner - MAINTENANCE;
  const payback = net > 0 ? GPU_PRICE / net : 0;

  const ownerEl = $('[data-owner]');
  const netEl = $('[data-net]');
  const paybackEl = $('[data-payback]');
  const labelEl = $('[data-util-label]');
  const ownerBar = $('[data-owner-bar]');
  const netBar = $('[data-net-bar]');

  const rounded = (n) => Math.round(n + 0.1);
  if (ownerEl) ownerEl.textContent = `$${rounded(owner)}`;
  if (netEl) netEl.textContent = `$${rounded(net)}`;
  if (paybackEl) paybackEl.textContent = currentLang === 'en' ? `~${Math.round(payback)} months` : `~${Math.round(payback)} ay`;
  if (labelEl) labelEl.textContent = currentLang === 'en' ? `${util}% utilization` : `%${util} doluluk`;
  if (ownerBar) ownerBar.style.width = `${Math.min(100, (owner / 80) * 100)}%`;
  if (netBar) netBar.style.width = `${Math.min(100, Math.max(4, (net / 80) * 100))}%`;
}
$$('.util-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.util-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    updateUtil(Number(btn.dataset.util));
  });
});
updateUtil(40);

/* ---------- configurator / waitlist ---------- */
const CONFIG_TIERS = [
  { min: 1000, max: 2499, gpu: '16 GB', ram: 64, storage: 2, note: 'Bireysel başlangıç', noteEn: 'Individual starter' },
  { min: 2500, max: 5999, gpu: '24 GB', ram: 128, storage: 4, note: 'Kreatif / geliştirici', noteEn: 'Creative / developer' },
  { min: 6000, max: 11999, gpu: '48 GB', ram: 256, storage: 8, note: 'Fine-tuning / yoğun inference', noteEn: 'Fine-tuning / heavy inference' },
  { min: 12000, max: 19999, gpu: '80 GB', ram: 512, storage: 16, note: 'Büyük model / ekip', noteEn: 'Large model / team' },
  { min: 20000, max: 34999, gpu: '2×80 GB', ram: 512, storage: 16, note: 'Küme / kurumsal pilot', noteEn: 'Cluster / enterprise pilot' },
  { min: 35000, max: 50000, gpu: '4×80 GB', ram: 1024, storage: 32, note: 'Rack / üretim', noteEn: 'Rack / production' },
];

const config = { budget: 7000, gpu: '48 GB', ram: 256, storage: 8, note: 'Fine-tuning / yoğun inference' };

const money = (n) => `$${Number(n).toLocaleString(currentLang === 'en' ? 'en-US' : 'tr-TR')}`;
const ramLabel = (gb) => (gb >= 1024 ? '1 TB' : `${gb} GB`);

function tierFor(budget) {
  return CONFIG_TIERS.find((t) => budget >= t.min && budget <= t.max) || CONFIG_TIERS[CONFIG_TIERS.length - 1];
}

function setActiveChip(containerSelector, attr, value) {
  $$(`${containerSelector} .chip`).forEach((chip) => {
    chip.classList.toggle('active', Number(chip.dataset[attr]) === Number(value));
  });
}

function configText() {
  const budgetWord = currentLang === 'en' ? 'budget' : 'bütçe';
  return `${config.gpu} GPU · ${ramLabel(config.ram)} RAM · ${config.storage} TB · ${money(config.budget)} ${budgetWord}`;
}

function renderConfig(resetChips = false) {
  const tier = tierFor(config.budget);
  config.gpu = tier.gpu;
  config.note = currentLang === 'en' ? tier.noteEn : tier.note;
  if (resetChips) {
    config.ram = tier.ram;
    config.storage = tier.storage;
  }

  const budgetValue = $('#budgetValue');
  const sumBudget = $('#sumBudget');
  const configGpu = $('#configGpu');
  const configNote = $('#configNote');
  const sumGpu = $('#sumGpu');
  const sumRam = $('#sumRam');
  const sumStorage = $('#sumStorage');

  if (budgetValue) budgetValue.textContent = money(config.budget);
  if (sumBudget) sumBudget.textContent = money(config.budget);
  if (configGpu) configGpu.textContent = `${config.gpu} GPU`;
  if (configNote) configNote.textContent = config.note;
  if (sumGpu) sumGpu.textContent = config.gpu;
  if (sumRam) sumRam.textContent = ramLabel(config.ram);
  if (sumStorage) sumStorage.textContent = `${config.storage} TB`;

  setActiveChip('#ramChips', 'ram', config.ram);
  setActiveChip('#storageChips', 'storage', config.storage);
}

const budgetSlider = $('#budgetSlider');
budgetSlider?.addEventListener('input', () => {
  config.budget = Number(budgetSlider.value);
  renderConfig(true);
});
$$('#ramChips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    config.ram = Number(chip.dataset.ram);
    renderConfig(false);
    updateSelectedConfig();
  });
});
$$('#storageChips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    config.storage = Number(chip.dataset.storage);
    renderConfig(false);
    updateSelectedConfig();
  });
});
renderConfig(true);

/* ---------- waitlist modal ---------- */
function updateSelectedConfig() {
  const el = $('#selectedConfig');
  const success = $('#successText');
  const text = configText();
  if (el) el.textContent = text;
  if (success) success.textContent = text;
}
function openModal() {
  updateSelectedConfig();
  const wtp = $('#wtpInput');
  if (wtp) wtp.value = config.budget;
  $('#preorderForm').hidden = false;
  $('#modalSuccess').hidden = true;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();
  setTimeout(() => $('#nameInput')?.focus(), 150);
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  unlockScroll();
}
$$('[data-waitlist]').forEach((btn) => btn.addEventListener('click', openModal));
$$('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));

$('#wtpInput')?.addEventListener('input', () => {
  const value = Number($('#wtpInput').value);
  if (Number.isFinite(value) && value >= 1000 && value <= 50000) {
    config.budget = value;
    renderConfig(true);
    updateSelectedConfig();
    if (budgetSlider) budgetSlider.value = String(value);
  }
});

$('#preorderForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#nameInput').value.trim();
  if (!name) {
    $('#nameInput').focus();
    return;
  }
  const wtp = Number($('#wtpInput').value);
  if (Number.isFinite(wtp) && wtp >= 1000 && wtp <= 50000) config.budget = wtp;
  renderConfig(true);
  updateSelectedConfig();
  $('#preorderForm').hidden = true;
  $('#modalSuccess').hidden = false;
  toast(msg(`Teşekkürler ${name.split(' ')[0]}, adını ilk rafa yazdık.`, `Thanks ${name.split(' ')[0]}, we've added your name to the first rack.`));
});

/* ---------- app utility actions ---------- */
$('#copyKey')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('sk-covan-demo-0427');
    toast(msg('API anahtarı kopyalandı (demo).', 'API key copied (demo).'));
  } catch {
    toast('sk-covan-demo-0427');
  }
});
$('#payoutBtn')?.addEventListener('click', () => toast(msg('Ödeme talimatı alındı (demo).', 'Payout requested (demo).')));
$('#proofBtn')?.addEventListener('click', () => toast(msg('Attestation raporu açıldı (demo).', 'Attestation report opened (demo).')));

/* ---------- language ---------- */
function translatePage(lang) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const key = source.trim();
    if (!key) return;
    const out = lang === 'en' ? (I18N_EN[key] || key) : key;
    if (out !== key) node.nodeValue = source.replace(key, out);
    else node.nodeValue = source;
  });

  $$('[placeholder]').forEach((el) => {
    if (!el.dataset.i18nPlaceholder) el.dataset.i18nPlaceholder = el.placeholder;
    const original = el.dataset.i18nPlaceholder;
    el.placeholder = lang === 'en' ? (I18N_PLACEHOLDERS[original] || original) : original;
  });

  document.title = lang === 'en'
    ? 'COVAN — AI, on your own hardware.'
    : 'COVAN — Yapay zekâ, kendi donanımında.';
  const meta = $('meta[name="description"]');
  if (meta) {
    meta.content = lang === 'en'
      ? 'Covan: your own GPU, hosted in our data center. Pay once, use without limits, rent it out when idle to cover upkeep.'
      : 'Covan: kendi GPU’n, bizim veri merkezimizde. Bir kez öde, limitsiz kullan, boşta kiralayıp bakımını öde.';
  }
}

function setLang(lang, persist = true) {
  currentLang = lang;
  document.documentElement.lang = lang;
  if (persist) {
    localStorage.setItem('covan-lang', lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  translatePage(lang);
  const toggle = $('#langToggle');
  if (toggle) toggle.textContent = lang === 'en' ? 'TR' : 'EN';
  renderConfig(false);
  updateUtil(currentUtil);
  setRent(rentOn, false);
  updateSelectedConfig();
  const activeView = $('.app-view.active')?.dataset.panelView || 'chat';
  setView(activeView);
}

$('#langToggle')?.addEventListener('click', () => {
  setLang(currentLang === 'tr' ? 'en' : 'tr');
});

/* ---------- keyboard ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('open')) {
    closeModal();
  } else if (app.classList.contains('open')) {
    closeApp();
  }
});

setLang(currentLang, false);
