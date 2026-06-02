// ── Daily Card ───────────────────────────────────────────────────────────────
// Per-browser: each browser picks a random card once per day, stored in localStorage.
// A different browser/device gets a different card. Resets at midnight local time.

const DAILY_AFFIRMATIONS = [
  "Hôm nay tôi mở lòng đón nhận những điều tốt đẹp đang đến.",
  "Tôi tin tưởng vào hành trình của chính mình.",
  "Tôi đủ mạnh để đối mặt với bất cứ điều gì hôm nay mang đến.",
  "Mỗi khoảnh khắc hiện tại là một cơ hội để bắt đầu lại.",
  "Tôi xứng đáng với tình yêu, sự thịnh vượng và bình yên.",
  "Tôi buông bỏ những gì không còn phục vụ tôi.",
  "Năng lượng của tôi là quà tặng — tôi trao nó cho những điều quan trọng.",
  "Tôi lắng nghe trực giác của mình và tin tưởng nó dẫn đường.",
  "Tôi đang phát triển, dù đôi khi tôi không nhận ra.",
  "Mọi thứ không phải lúc nào cũng theo kế hoạch — và đó không phải lúc nào cũng là điều xấu.",
  "Tôi chọn bình yên hơn là đúng.",
  "Hôm nay tôi là phiên bản tốt nhất của chính mình.",
  "Tôi cảm ơn những thử thách — chúng đang tôi luyện tôi.",
  "Tôi xứng đáng nghỉ ngơi mà không cần cảm thấy có lỗi.",
  "Tôi là ánh sáng, và ánh sáng đó không thể bị dập tắt.",
  "Tôi chọn nhìn vào vẻ đẹp của ngày hôm nay.",
  "Trái tim tôi đủ rộng để chứa đựng cả đau lẫn vui.",
  "Tôi tin rằng điều tốt nhất vẫn đang ở phía trước.",
  "Tôi đang đúng nơi tôi cần ở vào lúc này.",
  "Mỗi hơi thở là lời nhắc nhở tôi còn sống và còn cơ hội.",
  "Tôi tha thứ cho bản thân về những điều chưa hoàn hảo.",
  "Tôi có đủ thứ cần thiết để xử lý những gì đang đến hôm nay."
];

function getTodayKey() {
  const now = new Date();
  return `daily_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
}

function getDailyCard() {
  const now = new Date();
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem('tarot_daily') || 'null');

  let cardIndex, reversed, affirmationIndex;

  if (stored && stored.date === todayKey) {
    // Same day — reuse what this browser already drew
    cardIndex = stored.cardIndex;
    reversed = stored.reversed;
    affirmationIndex = stored.affirmationIndex;
  } else {
    // New day (or first visit) — pick randomly and save
    cardIndex = Math.floor(Math.random() * CARDS.length);
    reversed = Math.random() < 0.3;
    affirmationIndex = Math.floor(Math.random() * DAILY_AFFIRMATIONS.length);
    localStorage.setItem('tarot_daily', JSON.stringify({ date: todayKey, cardIndex, reversed, affirmationIndex }));
  }

  return {
    card: CARDS[cardIndex],
    reversed,
    affirmation: DAILY_AFFIRMATIONS[affirmationIndex],
    dateStr: now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  };
}

function renderDailyCard() {
  const { card, reversed, affirmation, dateStr } = getDailyCard();
  const section = document.getElementById('dailyCardSection');
  if (!section) return;

  const meaning = reversed ? card.reversed : card.upright;

  section.innerHTML = `
    <div class="daily-date">${dateStr}</div>
    <div class="daily-layout">
      <div class="daily-card-wrap" id="dailyCardWrap">
        <div class="daily-card" id="dailyCardInner">
          <div class="daily-card-back">${makeCardBackSVG()}</div>
          <div class="daily-card-front${reversed ? ' reversed-card' : ''}" style="background:${card.bg}">
            <div class="card-image">${makeCardImageHTML(card)}</div>
            <div class="card-name">${card.nameVi}${reversed ? ' ↓' : ''}</div>
          </div>
        </div>
        <div class="daily-flip-hint">✦ Nhấn để lật ✦</div>
      </div>
      <div class="daily-info" id="dailyInfo" style="display:none">
        <div class="daily-card-title">
          <span class="daily-numeral">${card.numeral}</span>
          <span class="daily-name">${card.name} · ${card.nameVi}</span>
          ${reversed ? '<span class="reversed-badge">↓ Ngược</span>' : ''}
        </div>
        <p class="daily-meaning">${meaning}</p>
        <div class="daily-affirmation">
          <span class="affirmation-label">✦ Lời Khẳng Định Hôm Nay ✦</span>
          <p class="affirmation-text">"${affirmation}"</p>
        </div>
      </div>
    </div>
  `;

  // Flip on click
  const wrap = document.getElementById('dailyCardWrap');
  const inner = document.getElementById('dailyCardInner');
  const info = document.getElementById('dailyInfo');
  let flipped = false;

  wrap.addEventListener('click', () => {
    if (flipped) return;
    flipped = true;
    inner.classList.add('flipped');
    wrap.querySelector('.daily-flip-hint').style.opacity = '0';
    spawnParticles(wrap);
    setTimeout(() => {
      info.style.display = 'block';
      info.style.animation = 'fadeInUp 0.6s ease';
    }, 600);
  });
}

document.addEventListener('DOMContentLoaded', renderDailyCard);
