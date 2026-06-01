// ── Stars ────────────────────────────────────────────────────────────────────
(function generateStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --dur:${2+Math.random()*4}s;
      animation-delay:${Math.random()*5}s;
    `;
    container.appendChild(s);
  }
})();

// ── SVG card art ─────────────────────────────────────────────────────────────
function makeCardBackSVG() {
  return `<img src="cards/mat-sau.jpg" alt="Mặt sau thẻ bài" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;"/>`;
}

function makeCardFrontSVG(card) {
  const [c1, c2, c3] = card.colors;
  return `<svg viewBox="0 0 140 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cg-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.15"/>
      </linearGradient>
      <radialGradient id="cgr-${card.id}" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="140" height="200" fill="${card.bg}"/>
    <rect width="140" height="200" fill="url(#cgr-${card.id})"/>
    <!-- Decorative border inner -->
    <rect x="5" y="5" width="130" height="190" fill="none" stroke="${c1}" stroke-width="0.8" rx="4" opacity="0.5"/>
    <!-- Corner ornaments -->
    <text x="8" y="20" fill="${c1}" font-size="9" opacity="0.7">✦</text>
    <text x="122" y="20" fill="${c1}" font-size="9" opacity="0.7">✦</text>
    <text x="8" y="196" fill="${c1}" font-size="9" opacity="0.7">✦</text>
    <text x="122" y="196" fill="${c1}" font-size="9" opacity="0.7">✦</text>
    <!-- Numeral -->
    <text x="70" y="30" text-anchor="middle" fill="${c1}" font-size="11"
      font-family="serif" letter-spacing="3" opacity="0.9">${card.numeral}</text>
    <!-- Central symbol -->
    <circle cx="70" cy="105" r="45" fill="none" stroke="${c1}" stroke-width="0.6" opacity="0.3"/>
    <circle cx="70" cy="105" r="32" fill="${c1}" fill-opacity="0.08"/>
    <text x="70" y="120" text-anchor="middle" fill="${c1}" font-size="44">${card.symbol}</text>
    <!-- Bottom decoration -->
    <line x1="20" y1="158" x2="120" y2="158" stroke="${c1}" stroke-width="0.5" opacity="0.4"/>
    <text x="70" y="178" text-anchor="middle" fill="${c2}" font-size="10"
      font-family="serif" opacity="0.7" letter-spacing="1">— ${card.nameVi} —</text>
  </svg>`;
}

// Returns the expected image path for a card. Files go in cards/ folder next to index.html.
// Naming: cards/00_the-fool.jpg, cards/01_the-magician.jpg, etc.
function getCardImagePath(card) {
  const slug = card.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const id = String(card.id).padStart(2, '0');
  return `cards/${id}_${slug}.jpg`;
}

// Builds the inner HTML for a card front's .card-image div.
// Uses real photo from cards/ folder when served via HTTP, else SVG fallback.
function makeCardImageHTML(card) {
  const imgPath = getCardImagePath(card);
  return `
    <img class="card-photo" src="${imgPath}" alt="${card.name}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
      style="width:100%;height:100%;object-fit:cover;display:block;">
    <div class="card-svg-fallback" style="display:none;width:100%;height:100%">${makeCardFrontSVG(card)}</div>
  `;
}

// ── State ────────────────────────────────────────────────────────────────────
let currentSpread = 1;
let drawnCards = [];
let flippedCount = 0;
let sessionComplete = false;

// ── Spread buttons ───────────────────────────────────────────────────────────
document.querySelectorAll('.spread-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (sessionComplete) return;
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpread = parseInt(btn.dataset.spread);
  });
});

// ── Draw ─────────────────────────────────────────────────────────────────────
document.getElementById('drawBtn').addEventListener('click', drawCards);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawCards() {
  if (sessionComplete) return;
  const btn = document.getElementById('drawBtn');
  btn.disabled = true;
  document.querySelectorAll('.spread-btn').forEach(b => b.disabled = true);

  const shuffled = shuffle(CARDS);
  const config = SPREAD_CONFIGS[currentSpread];
  drawnCards = shuffled.slice(0, currentSpread).map((card, i) => ({
    card,
    reversed: Math.random() < 0.3,
    label: config[i].label
  }));
  flippedCount = 0;

  renderSpread();
}

function renderSpread() {
  const area = document.getElementById('spreadArea');
  area.innerHTML = '';

  drawnCards.forEach((entry, i) => {
    const slot = document.createElement('div');
    slot.className = 'card-slot';

    const lbl = document.createElement('div');
    lbl.className = 'card-label';
    lbl.textContent = entry.label;

    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    wrapper.title = 'Nhấn để lật bài';

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;

    // Back
    const back = document.createElement('div');
    back.className = 'card-back';
    back.innerHTML = makeCardBackSVG();

    // Front
    const front = document.createElement('div');
    front.className = 'card-front' + (entry.reversed ? ' reversed-card' : '');
    front.style.background = entry.card.bg;

    const imgDiv = document.createElement('div');
    imgDiv.className = 'card-image';
    imgDiv.innerHTML = makeCardImageHTML(entry.card);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.textContent = entry.card.nameVi + (entry.reversed ? ' ↓' : '');

    front.appendChild(imgDiv);
    front.appendChild(nameDiv);
    card.appendChild(back);
    card.appendChild(front);
    wrapper.appendChild(card);

    wrapper.addEventListener('click', () => flipCard(i, card, wrapper));

    slot.appendChild(lbl);
    slot.appendChild(wrapper);
    area.appendChild(slot);

    // Staggered entrance animation
    card.style.opacity = '0';
    card.style.transform = 'rotateY(0) translateY(30px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s, transform 0.5s';
      card.style.opacity = '1';
      card.style.transform = 'rotateY(0) translateY(0)';
    }, i * 180);
  });
}

function flipCard(index, cardEl, wrapper) {
  if (cardEl.classList.contains('flipped')) return;

  cardEl.style.transition = '';
  cardEl.style.transform = '';
  cardEl.classList.add('flipped');
  spawnParticles(wrapper);
  flippedCount++;

  if (flippedCount === drawnCards.length) {
    setTimeout(showReading, 800);
  }
}

// ── Particles ────────────────────────────────────────────────────────────────
function spawnParticles(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#d4a943','#f0d080','#ffffff','#a86ccc','#7ec8ff'];

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 3 + Math.random() * 5;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${cx}px; top:${cy}px;
    `;
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 100;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 400, easing: 'ease-out' }).onfinish = () => p.remove();
  }
}

// ── Reading ──────────────────────────────────────────────────────────────────
function showReading() {
  sessionComplete = true;
  const panel = document.getElementById('readingPanel');
  const content = document.getElementById('readingContent');

  content.innerHTML = drawnCards.map((entry, idx) => {
    const c = entry.card;
    const rev = entry.reversed;
    const uid = `card-${idx}`;
    const tabs = [
      { key: 'overview', label: 'Tổng Quan', text: rev ? c.reversed : c.upright },
      { key: 'love',     label: '❤ Tình Yêu', text: c.details?.love    || '' },
      { key: 'career',   label: '💼 Sự Nghiệp', text: c.details?.career || '' },
      { key: 'spirit',   label: '✦ Tâm Linh', text: c.details?.spirit  || '' },
      { key: 'advice',   label: '🌟 Lời Khuyên', text: c.details?.advice || '' },
    ].filter(t => t.text);

    return `
    <div class="card-reading">
      <div class="card-reading-header">
        <span class="card-reading-position">${entry.label}</span>
        <span class="card-reading-name">${c.numeral}. ${c.name} · ${c.nameVi}</span>
        ${rev ? '<span class="reversed-badge">↓ Ngược</span>' : ''}
      </div>
      <div class="detail-tabs">
        ${tabs.map((t, i) => `
          <button class="detail-tab${i===0?' active':''}"
            onclick="switchTab('${uid}','${t.key}',this)">${t.label}</button>
        `).join('')}
      </div>
      <div class="detail-content">
        ${tabs.map((t, i) => `
          <div class="detail-panel${i===0?' active':''}" id="${uid}-${t.key}">${t.text}</div>
        `).join('')}
      </div>
    </div>`;
  }).join('');

  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function switchTab(uid, key, btn) {
  const content = btn.closest('.card-reading').querySelector('.detail-content');
  content.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('active'));
  content.querySelector(`#${uid}-${key}`).classList.add('active');
  btn.closest('.detail-tabs').querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── Reset ────────────────────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', resetAll);

function resetAll() {
  sessionComplete = false;
  drawnCards = [];
  flippedCount = 0;
  document.getElementById('spreadArea').innerHTML = '';
  document.getElementById('readingPanel').classList.remove('visible');
  document.getElementById('drawBtn').disabled = false;
  document.querySelectorAll('.spread-btn').forEach(b => b.disabled = false);
  document.getElementById('questionInput').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
