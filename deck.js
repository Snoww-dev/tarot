(function () {
  // ── DOM refs ──────────────────────────────────────────────────────────────
  const deckIdle        = document.getElementById('deckIdle');
  const shuffleBtn      = document.getElementById('shuffleBtn');
  const deckFan         = document.getElementById('deckFan');
  const deckGrid        = document.getElementById('deckGrid');
  const deckReveal      = document.getElementById('deckReveal');
  const deckFlipInner   = document.getElementById('deckFlipInner');
  const deckFlipFrontImg= document.getElementById('deckFlipFrontImg');
  const drName          = document.getElementById('drName');
  const drReversed      = document.getElementById('drReversed');
  const drMsg           = document.getElementById('drMsg');
  const drClose         = document.getElementById('drClose');
  const deckReading     = document.getElementById('deckReading');

  // ── Shuffle phase DOM (sẽ inject vào deckIdle) ───────────────────────────
  const shufflePhaseEl  = document.getElementById('shufflePhase');
  const shuffleProgress = document.getElementById('shuffleProgress');
  const shuffleLabel    = document.getElementById('shuffleLabel');
  const shuffleDone     = document.getElementById('shuffleDone');

  // ── Multi-select state ────────────────────────────────────────────────────
  let spreadSize    = 1;   // 1 | 3 | 5 — synced từ app.js currentSpread
  let selectedCards = [];  // [{card, reversed, imgSrc}]
  let fanCards      = [];  // thứ tự xáo của bộ 78 lá

  // ── Image map ─────────────────────────────────────────────────────────────
  const cardImages = [
    'cards/00_the-fool.jpg','cards/01_the-magician.jpg','cards/02_the-high-priestess.jpg',
    'cards/03_the-empress.jpg','cards/04_the-emperor.jpg','cards/05_the-hierophant.jpg',
    'cards/06_the-lovers.jpg','cards/07_the-chariot.jpg','cards/08_strength.jpg',
    'cards/09_the-hermit.jpg','cards/10_wheel-of-fortune.jpg','cards/11_justice.jpg',
    'cards/12_the-hanged-man.jpg','cards/13_death.jpg','cards/14_temperance.jpg',
    'cards/15_the-devil.jpg','cards/16_the-tower.jpg','cards/17_the-star.jpg',
    'cards/18_the-moon.jpg','cards/19_the-sun.jpg','cards/20_judgement.jpg',
    'cards/21_the-world.jpg','cards/22_ace-of-wands.jpg','cards/23_two-of-wands.jpg',
    'cards/24_three-of-wands.jpg','cards/25_four-of-wands.jpg','cards/26_five-of-wands.jpg',
    'cards/27_six-of-wands.jpg','cards/28_seven-of-wands.jpg','cards/29_eight-of-wands.jpg',
    'cards/30_nine-of-wands.jpg','cards/31_ten-of-wands.jpg','cards/32_page-of-wands.jpg',
    'cards/33_knight-of-wands.jpg','cards/34_queen-of-wands.jpg','cards/35_king-of-wands.jpg',
    'cards/36_ace-of-cups.jpg','cards/37_two-of-cups.jpg','cards/38_three-of-cups.jpg',
    'cards/39_four-of-cups.jpg','cards/40_five-of-cups.jpg','cards/41_six-of-cups.jpg',
    'cards/42_seven-of-cups.jpg','cards/43_eight-of-cups.jpg','cards/44_nine-of-cups.jpg',
    'cards/45_ten-of-cups.jpg','cards/46_page-of-cups.jpg','cards/47_knight-of-cups.jpg',
    'cards/48_queen-of-cups.jpg','cards/49_king-of-cups.jpg','cards/50_ace-of-swords.jpg',
    'cards/51_two-of-swords.jpg','cards/52_three-of-swords.jpg','cards/53_four-of-swords.jpg',
    'cards/54_five-of-swords.jpg','cards/55_six-of-swords.jpg','cards/56_seven-of-swords.jpg',
    'cards/57_eight-of-swords.jpg','cards/58_nine-of-swords.jpg','cards/59_ten-of-swords.jpg',
    'cards/60_page-of-swords.jpg','cards/61_knight-of-swords.jpg','cards/62_queen-of-swords.jpg',
    'cards/63_king-of-swords.jpg','cards/64_ace-of-pentacles.jpg','cards/65_two-of-pentacles.jpg',
    'cards/66_three-of-pentacles.jpg','cards/67_four-of-pentacles.jpg','cards/68_five-of-pentacles.jpg',
    'cards/69_six-of-pentacles.jpg','cards/70_seven-of-pentacles.jpg','cards/71_eight-of-pentacles.jpg',
    'cards/72_nine-of-pentacles.jpg','cards/73_ten-of-pentacles.jpg','cards/74_page-of-pentacles.jpg',
    'cards/75_knight-of-pentacles.jpg','cards/76_queen-of-pentacles.jpg','cards/77_king-of-pentacles.jpg',
  ];

  // ── Đọc spreadSize từ app.js (currentSpread là module-level var) ──────────
  function getSpreadSize() {
    return (typeof currentSpread !== 'undefined') ? currentSpread : 1;
  }

  // ── Bước 1 → Shuffle phase ────────────────────────────────────────────────
  shuffleBtn.addEventListener('click', () => {
    spreadSize    = getSpreadSize();
    selectedCards = [];
    startShufflePhase();
  });

  const SHUFFLE_STEPS = [
    'Tập trung năng lượng vào bộ bài...',
    'Xáo bài lần một...',
    'Đảo ngược năng lượng...',
    'Xáo bài lần hai...',
    'Cân bằng lại các lá bài...',
    'Bộ bài đã sẵn sàng!',
  ];

  function startShufflePhase() {
    // Ẩn nút xáo, hiện phase trộn bài
    shuffleBtn.style.display  = 'none';
    shufflePhaseEl.style.display = 'flex';
    shuffleDone.style.display = 'none';

    let step = 0;
    updateShuffleStep(step);

    const interval = setInterval(() => {
      step++;
      if (step < SHUFFLE_STEPS.length) {
        updateShuffleStep(step);
      } else {
        clearInterval(interval);
        // Xong — hiện nút "Chọn bài"
        shuffleDone.style.display = 'block';
        shuffleLabel.textContent  = '✦ Bộ bài đã được xáo ✦';
        shuffleProgress.textContent = `${SHUFFLE_STEPS.length}/${SHUFFLE_STEPS.length}`;
      }
    }, 700);
  }

  function updateShuffleStep(step) {
    shuffleLabel.textContent    = SHUFFLE_STEPS[step];
    shuffleProgress.textContent = `${step + 1}/${SHUFFLE_STEPS.length}`;

    // Animate thanh progress
    const pct = ((step + 1) / SHUFFLE_STEPS.length) * 100;
    document.getElementById('shuffleBar').style.width = pct + '%';
  }

  // Nút "Chọn Bài" sau khi xáo xong
  shuffleDone.addEventListener('click', () => {
    shufflePhaseEl.style.display = 'none';
    shuffleBtn.style.display     = 'block';
    deckIdle.style.display       = 'none';
    deckGrid.innerHTML = '';
    fanCards = buildFan();
    deckFan.style.display = 'block';
    // Cập nhật counter
    updateSelectCounter();
    deckFan.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Bước 2: Xây fan 78 lá ─────────────────────────────────────────────────
  function buildFan() {
    const deck = [...CARDS].sort(() => Math.random() - 0.5);
    const N    = deck.length;
    const totalAngle = 160;
    const radius     = 520;
    const cardW      = 62;
    const built      = [];

    deck.forEach((card, i) => {
      const reversed = Math.random() < 0.3;
      const imgSrc   = cardImages[card.id] || 'cards/mat-sau.jpg';

      const angle = -totalAngle / 2 + (totalAngle / (N - 1)) * i;
      const rad   = (angle * Math.PI) / 180;
      const x     = radius * Math.sin(rad);
      const y     = radius - radius * Math.cos(rad);

      const slot = document.createElement('div');
      slot.className = 'deck-card';
      slot.style.cssText = `
        margin-left: ${-cardW / 2}px;
        transform: translateX(${x}px) translateY(${-y}px) rotate(${angle}deg);
        z-index: ${i};
        animation: cardDeal 0.3s ease both;
        animation-delay: ${i * 12}ms;
      `;
      slot.innerHTML = `
        <div class="deck-card-inner">
          <div class="deck-card-back"><img src="cards/mat-sau.jpg" alt="mặt sau"></div>
          <div class="deck-card-front">
            <img src="${imgSrc}" alt="${card.nameVi}"
              style="${reversed ? 'transform:rotate(180deg);' : ''}">
          </div>
        </div>
      `;

      slot.addEventListener('click', () => onFanCardClick(slot, card, reversed, imgSrc));
      deckGrid.appendChild(slot);
      built.push({ slot, card, reversed, imgSrc });
    });

    return built;
  }

  // ── Click chọn lá từ fan ──────────────────────────────────────────────────
  function onFanCardClick(slot, card, reversed, imgSrc) {
    if (slot.classList.contains('selected-card')) return;
    spreadSize = getSpreadSize();
    if (selectedCards.length >= spreadSize) return;

    // Đánh dấu đã chọn
    slot.classList.add('selected-card');
    slot.style.filter = 'brightness(1.5) drop-shadow(0 0 14px #d4a943)';
    slot.style.zIndex = 200 + selectedCards.length;

    selectedCards.push({ card, reversed, imgSrc });
    updateSelectCounter();

    // Đủ lá → chuyển sang reveal
    if (selectedCards.length === spreadSize) {
      setTimeout(() => {
        deckFan.style.display = 'none';
        showMultiReveal();
      }, 600);
    }
  }

  function updateSelectCounter() {
    spreadSize = getSpreadSize();
    const counter = document.getElementById('selectCounter');
    if (counter) {
      counter.textContent = `Đã chọn ${selectedCards.length}/${spreadSize} lá bài`;
    }
  }

  // ── Bước 3: Hiện các lá đã chọn, lật từng cái ───────────────────────────
  const SPREAD_LABELS = {
    1: ['Thông điệp'],
    3: ['Quá Khứ', 'Hiện Tại', 'Tương Lai'],
    5: ['Hoàn Cảnh', 'Thách Thức', 'Quá Khứ', 'Tương Lai', 'Kết Quả'],
  };

  function showMultiReveal() {
    deckReveal.style.display = 'none';

    const multiReveal    = document.getElementById('multiReveal');
    const multiRevealRow = document.getElementById('multiRevealRow');
    multiRevealRow.innerHTML = '';
    multiReveal.style.display = 'block';

    // Xoá hint cũ nếu có
    const oldHint = multiReveal.querySelector('.multi-flip-hint');
    if (oldHint) oldHint.remove();

    const labels = SPREAD_LABELS[selectedCards.length] || selectedCards.map((_, i) => `Lá ${i + 1}`);
    let flippedCount = 0;

    selectedCards.forEach(({ card, reversed, imgSrc }, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'multi-card-slot';
      wrap.style.animationDelay = `${idx * 200}ms`;

      const labelEl = document.createElement('div');
      labelEl.className = 'multi-card-label';
      labelEl.textContent = labels[idx];

      const flipper = document.createElement('div');
      flipper.className = 'multi-flip-card';
      flipper.title = 'Nhấn để lật';

      const inner = document.createElement('div');
      inner.className = 'multi-flip-inner';

      const back = document.createElement('div');
      back.className = 'multi-flip-back';
      back.innerHTML = `<img src="cards/mat-sau.jpg" alt="mặt sau">`;

      const front = document.createElement('div');
      front.className = 'multi-flip-front';
      front.innerHTML = `<img src="${imgSrc}" alt="${card.nameVi}"
        style="${reversed ? 'transform:rotate(180deg);' : ''}"
        onerror="this.src='cards/mat-sau.jpg'">`;

      inner.appendChild(back);
      inner.appendChild(front);
      flipper.appendChild(inner);
      wrap.appendChild(labelEl);
      wrap.appendChild(flipper);
      multiRevealRow.appendChild(wrap);

      flipper.addEventListener('click', () => {
        if (inner.classList.contains('flipped')) return;
        inner.classList.add('flipped');
        spawnParticles(flipper);
        flippedCount++;
        if (flippedCount === selectedCards.length) {
          setTimeout(showSynthesis, 900);
        }
      });
    });

    const hint = document.createElement('p');
    hint.className = 'multi-flip-hint';
    hint.textContent = '✦ Nhấn vào từng lá bài để lật ✦';
    multiReveal.appendChild(hint);

    multiReveal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Bước 4: Thông điệp tổng hợp ─────────────────────────────────────────
  const SYNTHESIS_INTRO = [
    'Những lá bài bạn chọn hôm nay không phải ngẫu nhiên — chúng phản chiếu chính xác năng lượng bạn đang mang.',
    'Vũ trụ đã lắng nghe và phản hồi qua từng lá bài bạn cảm nhận.',
    'Hành trình bên trong bạn đang được phản chiếu rõ ràng qua bộ bài hôm nay.',
    'Mỗi lá bài là một mảnh ghép của bức tranh toàn cảnh về con đường bạn đang đi.',
  ];

  function buildSynthesisMessage(cards) {
    const labels = SPREAD_LABELS[cards.length] || cards.map((_, i) => `Lá ${i + 1}`);

    if (cards.length === 1) {
      const { card, reversed } = cards[0];
      return `Lá <strong>${card.nameVi}</strong>${reversed ? ' (Ngược)' : ''} xuất hiện như một gương chiếu — ` +
        `${reversed ? card.reversed : card.upright} Đây là thông điệp cốt lõi vũ trụ muốn bạn lắng nghe hôm nay.`;
    }

    if (cards.length === 3) {
      const [past, present, future] = cards;
      return `<strong>${labels[0]} — ${past.card.nameVi}${past.reversed ? ' ↓' : ''}</strong> cho thấy nền tảng bạn đang đứng trên. ` +
        `<strong>${labels[1]} — ${present.card.nameVi}${present.reversed ? ' ↓' : ''}</strong> là trung tâm của hành trình hiện tại, ` +
        `kêu gọi bạn chú ý vào điều đang xảy ra ngay lúc này. ` +
        `<strong>${labels[2]} — ${future.card.nameVi}${future.reversed ? ' ↓' : ''}</strong> hé lộ hướng năng lượng đang chảy về — ` +
        `không phải số phận cố định, mà là tiềm năng đang chờ bạn khai mở.`;
    }

    if (cards.length === 5) {
      const names = cards.map((c, i) => `<strong>${labels[i]} — ${c.card.nameVi}${c.reversed ? ' ↓' : ''}</strong>`);
      return `${names[0]} đặt ra bối cảnh tổng thể, trong khi ${names[1]} chỉ ra thử thách cần đối mặt. ` +
        `${names[2]} tiết lộ những gì từ quá khứ vẫn còn ảnh hưởng, còn ${names[3]} mở ra con đường phía trước. ` +
        `${names[4]} là năng lượng kết quả — tổng hòa của tất cả những gì bạn đang mang và đang hướng đến.`;
    }

    return cards.map((c, i) =>
      `<strong>${labels[i]} — ${c.card.nameVi}${c.reversed ? ' ↓' : ''}</strong>: ${c.reversed ? c.card.reversed : c.card.upright}`
    ).join('<br><br>');
  }

  function showSynthesis() {
    const synthesis = document.getElementById('deckSynthesis');
    synthesis.innerHTML = '';
    synthesis.style.display = 'block';

    const intro = SYNTHESIS_INTRO[Math.floor(Math.random() * SYNTHESIS_INTRO.length)];
    const msg   = buildSynthesisMessage(selectedCards);

    synthesis.innerHTML = `
      <div class="synthesis-header">
        <span class="synthesis-star">✦</span>
        <span>THÔNG ĐIỆP TỔNG HỢP</span>
        <span class="synthesis-star">✦</span>
      </div>
      <p class="synthesis-intro">${intro}</p>
      <div class="synthesis-cards">
        ${selectedCards.map((c, i) => `
          <div class="synthesis-card-chip ${c.reversed ? 'reversed' : ''}">
            <span class="synthesis-chip-label">${(SPREAD_LABELS[selectedCards.length] || [])[i] || 'Lá ' + (i+1)}</span>
            <span class="synthesis-chip-name">${c.card.nameVi}${c.reversed ? ' ↓' : ''}</span>
          </div>
        `).join('')}
      </div>
      <p class="synthesis-msg">${msg}</p>
      <div class="synthesis-actions">
        <button class="synthesis-btn" id="synthNewBtn">✦ XÁO BÀI MỚI ✦</button>
        <button class="synthesis-btn secondary" id="synthDetailBtn">✦ XEM CHI TIẾT TỪNG LÁ ✦</button>
      </div>
    `;

    synthesis.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('synthNewBtn').addEventListener('click', resetDeck);
    document.getElementById('synthDetailBtn').addEventListener('click', showDetailPanel);
  }

  // ── Chi tiết từng lá (panel mở rộng bên dưới) ───────────────────────────
  function showDetailPanel() {
    const labels = SPREAD_LABELS[selectedCards.length] || selectedCards.map((_, i) => `Lá ${i + 1}`);
    const detail = document.getElementById('deckDetail');
    detail.innerHTML = '';
    detail.style.display = 'block';

    selectedCards.forEach(({ card, reversed }, idx) => {
      const meaning = reversed ? card.reversed : card.upright;
      const tabs    = [
        { key: 'ov',  label: 'Tổng Quan',    text: meaning },
        { key: 'lv',  label: '❤ Tình Yêu',   text: card.details?.love    || '' },
        { key: 'ca',  label: '💼 Sự Nghiệp', text: card.details?.career  || '' },
        { key: 'sp',  label: '✦ Tâm Linh',   text: card.details?.spirit  || '' },
        { key: 'ad',  label: '🌟 Lời Khuyên', text: card.details?.advice  || '' },
      ].filter(t => t.text);

      const uid = `dk-${idx}`;
      const block = document.createElement('div');
      block.className = 'deck-detail-block';
      block.innerHTML = `
        <div class="deck-detail-header">
          <span class="deck-detail-pos">${labels[idx]}</span>
          <span class="deck-detail-name">${card.numeral}. ${card.name} · ${card.nameVi}</span>
          ${reversed ? '<span class="reversed-badge">↓ Ngược</span>' : ''}
        </div>
        <div class="detail-tabs">
          ${tabs.map((t, i) => `
            <button class="detail-tab${i === 0 ? ' active' : ''}"
              onclick="deckSwitchTab('${uid}','${t.key}',this)">${t.label}</button>
          `).join('')}
        </div>
        <div class="detail-content">
          ${tabs.map((t, i) => `
            <div class="detail-panel${i === 0 ? ' active' : ''}" id="${uid}-${t.key}">${t.text}</div>
          `).join('')}
        </div>
      `;
      detail.appendChild(block);
    });

    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.deckSwitchTab = function(uid, key, btn) {
    const block = btn.closest('.deck-detail-block');
    block.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('active'));
    block.querySelector(`#${uid}-${key}`).classList.add('active');
    block.querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };

  // ── Reset về đầu ─────────────────────────────────────────────────────────
  function resetDeck() {
    selectedCards = [];
    deckGrid.innerHTML = '';
    document.getElementById('multiReveal').style.display  = 'none';
    document.getElementById('deckSynthesis').style.display= 'none';
    document.getElementById('deckDetail').style.display   = 'none';
    deckFan.style.display    = 'none';
    deckReveal.style.display = 'none';
    shuffleBtn.style.display = 'block';
    shufflePhaseEl.style.display = 'none';
    deckIdle.style.display   = 'flex';
    deckIdle.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── Nút cũ "XÁO BÀI MỚI" trong single-reveal ────────────────────────────
  drClose.addEventListener('click', resetDeck);

})();
