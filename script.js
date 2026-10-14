const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => revealObserver.observe(item));

const body = document.body;
for (let i = 0; i < 18; i += 1) {
  const heart = document.createElement('span');
  heart.innerHTML = '❤';
  heart.className = 'floating-heart';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.top = `${Math.random() * 100}%`;
  heart.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
  heart.style.animationDuration = `${(6 + Math.random() * 8).toFixed(2)}s`;
  heart.style.opacity = (0.25 + Math.random() * 0.6).toFixed(2);
  heart.style.fontSize = `${(0.9 + Math.random() * 1.6).toFixed(2)}rem`;
  body.appendChild(heart);
}

const wheel = document.querySelector('.wheel');
const resultBox = document.getElementById('giftResult');
const giftChoices = document.querySelectorAll('.gift-choice');
const burst = document.getElementById('surpriseBurst');
const winnerOverlay = document.getElementById('winnerOverlay');
const winnerTitle = document.getElementById('winnerTitle');
const winnerText = document.getElementById('winnerText');
const winnerClose = document.getElementById('winnerClose');
const winnerEmoji = document.getElementById('winnerEmoji');

// Remembers her pick so refreshing can't reset it
const PRIZE_KEY = 'giftPrizePicked';
const store = {
  get() { try { return localStorage.getItem(PRIZE_KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(PRIZE_KEY, v); } catch {} },
  clear() { try { localStorage.removeItem(PRIZE_KEY); } catch {} }
};
// Visit yoursite.com/?reset to clear it while testing
if (location.search.includes('reset')) store.clear();

// Splits emoji correctly (the old .split('') broke them)
const splitEmoji = (str) =>
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str), (s) => s.segment)
    : Array.from(str);

// Rotation that puts each prize under the pointer at the top
const WHEEL_ANGLE = { 'Tattoo voucher': 300, 'Massage coupon': 180, 'Mystery prize': 60 };

let selectionLocked = false;

const closeWinner = () => {
  winnerOverlay.classList.remove('show');
  winnerOverlay.querySelectorAll('.prize-emoji').forEach((e) => e.remove());
};

winnerClose.addEventListener('click', closeWinner);
winnerOverlay.addEventListener('click', (event) => {
  if (event.target === winnerOverlay) closeWinner();
});

const spawnPrizeBurst = (emojiString) => {
  splitEmoji(emojiString).forEach((emoji, index) => {
    const bubble = document.createElement('span');
    bubble.className = 'prize-emoji';
    bubble.textContent = emoji;
    bubble.style.left = `${50 + (Math.random() * 50 - 25)}%`;
    bubble.style.top = `${50 + (Math.random() * 25 - 12)}%`;
    bubble.style.setProperty('--dx', `${(Math.random() * 300 - 150).toFixed(0)}px`);
    bubble.style.setProperty('--dy', `${(-150 - index * 12 - Math.random() * 140).toFixed(0)}px`);
    bubble.style.setProperty('--rot', `${(Math.random() * 360).toFixed(0)}deg`);
    bubble.style.animationDelay = `${(index * 0.07).toFixed(2)}s`;
    winnerOverlay.appendChild(bubble);
  });
};

const spawnConfetti = () => {
  burst.innerHTML = '';
  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${50 + (Math.random() * 40 - 20)}%`;
    piece.style.background = ['#ff5ea8', '#ffd166', '#d7c3ff', '#9fe7d3', '#ff98b7', '#ffffff'][i % 6];
    piece.style.setProperty('--dx', `${(Math.random() * 260 - 130).toFixed(0)}px`);
    piece.style.setProperty('--dy', `${(Math.random() * 220 + 90).toFixed(0)}px`);
    piece.style.setProperty('--rot', `${(Math.random() * 360).toFixed(0)}deg`);
    piece.style.animationDelay = `${(Math.random() * 0.25).toFixed(2)}s`;
    burst.appendChild(piece);
  }
};

const showResult = (title, text) => {
  resultBox.innerHTML = `
    <p class="result-title">${title}</p>
    <p class="result-text">${text}</p>
  `;
  resultBox.classList.add('revealed');
};

const setResult = (title, text, emojiString) => {
  showResult(title, text);
  spawnConfetti();

  const isMystery = title === 'Mystery prize';
  spawnPrizeBurst(isMystery ? '🐾🐾🐾🐾🐶🐶💖' : emojiString);
  winnerEmoji.textContent = isMystery ? '🐶' : splitEmoji(emojiString)[0];

  winnerTitle.textContent = title;
  winnerText.textContent = text;
  winnerOverlay.classList.add('show');
};

giftChoices.forEach((button) => {
  button.addEventListener('click', () => {
    if (selectionLocked) return;
    selectionLocked = true;

    const prize = button.dataset.prize;
    const reveal = button.dataset.reveal;
    const emojiString = button.dataset.emoji || '✨💖🎉';

    giftChoices.forEach((choice) => (choice.disabled = true));
    store.set(prize);

    wheel.style.transform = `rotate(${(WHEEL_ANGLE[prize] ?? 0) + 1080}deg)`;

    // wait for the 3.5s spin to finish before the reveal
    setTimeout(() => setResult(prize, reveal, emojiString), 3700);
  });
});

// If she already picked, restore that state on page load
const saved = store.get();
const savedBtn = [...giftChoices].find((b) => b.dataset.prize === saved);
if (savedBtn) {
  selectionLocked = true;
  giftChoices.forEach((c) => (c.disabled = true));
  wheel.style.transition = 'none';
  wheel.style.transform = `rotate(${WHEEL_ANGLE[saved]}deg)`;
  showResult(saved, savedBtn.dataset.reveal);
}
