// Экраны

// Экраны
const screens = {
  w1: document.getElementById('window1'),
  w2: document.getElementById('window2'),
  w3: document.getElementById('window3'),
};

// Элементы окна 1
const cardRandom = document.getElementById('action_center_left');
const cardInput = document.getElementById('action_center_center');
const cardCategory = document.getElementById('action_center_right');

const btnRandomStart = cardRandom.querySelector('button');
const btnInputStart = cardInput.querySelector('button');
const btnCategoryStart = cardCategory.querySelector('button');
const inputSecret = document.getElementById('secretWord');
const selectCategory = document.getElementById('category');

// Элементы окна 2
const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDiv = document.getElementById('word');
const keyboardDiv = document.getElementById('keyboard');
const attemptsSpan = document.getElementById('attempts');

// Элементы окна 3
const resultTitle = document.getElementById('result');
const resultImage = document.getElementById('resultImage');
const btnNewGame = document.getElementById('newGame');

// Игровые данные
let secret = '';
let revealed = [];
let attempts = 10;

const ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split("");

// Категории слов под твой <select>
const WORDS = {
  bike: ["хонда","ямаха","сузуки","кавасаки","дукати","бмв","харлей","триумф","априлия","ктм"],
  cities: ["минск","москва","брест","гродно","витебск","могилёв","париж","рим","берлин","киев","варшава","вильнюс","рига","тбилиси","алматы"],
  animal: ["тигр","лев","волк","медведь","енот","панда","слон","жираф","лисица","сокол","кабан","косуля","сурок","бобр","барсук"],
  meal: ["бургер","пицца","суп","плов","котлета","шаурма","салат","роллы","стейк","хачапури","борщ","окрошка","чебурек","пельмени","вареники"],
  profession: ["шеф","врач","пекарь","слесарь","ювелир","шахтёр","плотник","инженер","пилот","повар","учитель","водитель","строитель","менеджер","дизайнер"]
};
const ALL_WORDS = [...WORDS.bike, ...WORDS.cities, ...WORDS.animal, ...WORDS.meal, ...WORDS.profession];

// Навигация экранов
function showScreen(id) {
  screens.w1.classList.remove('active');
  screens.w2.classList.remove('active');
  screens.w3.classList.remove('active');
  document.getElementById(id).classList.add('active');
}

// Стартовые режимы
btnRandomStart.addEventListener('click', () => {
  secret = pickRandom(ALL_WORDS);
  beginGame();
});

btnInputStart.addEventListener('click', () => {
  const raw = (inputSecret.value || '').trim().toLowerCase();
  const cleaned = normalizeWord(raw);
  if (!cleaned) return;
  secret = cleaned;
  beginGame();
});

btnCategoryStart.addEventListener('click', () => {
  const cat = selectCategory.value;
  const list = WORDS[cat] || ALL_WORDS;
  secret = pickRandom(list);
  beginGame();
});

// Новая игра
btnNewGame.addEventListener('click', () => {
  resetGameState();
  showScreen('window1');
});

// Инициализация одной партии
function beginGame() {
  revealed = Array(secret.length).fill(false);
  attempts = 10;
  attemptsSpan.textContent = attempts;
  renderWord();
  renderKeyboard();
  drawHangman(0);
  showScreen('window2');
}

// Сброс
function resetGameState() {
  secret = '';
  revealed = [];
  attempts = 10;
  inputSecret.value = '';
  keyboardDiv.innerHTML = '';
  wordDiv.innerHTML = '';
  attemptsSpan.textContent = attempts;
  resultImage.innerHTML = ''; // очищаем картинку результата
  drawHangman(0);
}

// Рендер слова (ячейки по буквам)
function renderWord() {
  wordDiv.innerHTML = '';
  for (let i = 0; i < secret.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'letter';
    cell.textContent = revealed[i] ? secret[i] : '';
    wordDiv.appendChild(cell);
  }
}

// Рендер экранной клавиатуры
function renderKeyboard() {
  keyboardDiv.innerHTML = '';
  ALPHABET.forEach(ch => {
    const btn = document.createElement('button');
    btn.textContent = ch;
    btn.addEventListener('click', () => onGuess(ch, btn));
    keyboardDiv.appendChild(btn);
  });
}

// Обработка угадывания буквы
function onGuess(ch, btn) {
  if (btn) btn.disabled = true; // если пришло из экранной клавы — блокируем кнопку

  let hit = false;
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === ch && !revealed[i]) {
      revealed[i] = true;
      hit = true;
    }
  }

  if (!hit) {
    attempts--;
    attemptsSpan.textContent = attempts;
    const step = 10 - attempts; // шаг рисования виселицы
    drawHangman(step);
  }

  renderWord();
  checkEnd();
}

// Проверка конца игры
function checkEnd() {
  const won = revealed.every(Boolean);
  const lost = attempts <= 0;

  if (won) {
    resultTitle.textContent = `Победа! Слово: ${secret}`;
    resultImage.innerHTML = `<img src="images/win.jpg" alt="Победа" style="margin-top:10px;margin-bottom: 10px;height:230px;width:auto;">`;
    showScreen('window3');
  } else if (lost) {
    resultTitle.textContent = `Поражение! Слово было: ${secret}`;
    resultImage.innerHTML = `<img src="images/lose.jpg" alt="Поражение" style="margin-top:10px; margin-bottom: 10px;height:230px;width:auto;">`;
    showScreen('window3');
  }
}

// Ввод с обычной клавиатуры: работает на окне 2
document.addEventListener('keydown', (e) => {
  if (screens.w2.classList.contains('active')) {
    const ch = e.key.toLowerCase();
    if (ALPHABET.includes(ch)) {
      // найдём соответствующую кнопку экранной клавиатуры
      const btns = keyboardDiv.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent === ch && !btn.disabled) {
          onGuess(ch, btn);
          break;
        }
      }
    }
  }
});

// Вспомогательные
function pickRandom(list) {
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

function normalizeWord(w) {
  // только русские буквы (включая ё)
  return w.replace(/[^а-яё]/g, '');
}

// Рисование виселицы
function drawHangman(step = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';

  const baseY = 280;
  const baseX = 40;
  const beamX = 140;
  const topY = 40;

  // 1) основание
  if (step >= 1) line(20, baseY, 120, baseY);
  // 2) стойка
  if (step >= 2) line(baseX, baseY, baseX, topY);
  // 3) перекладина
  if (step >= 3) line(baseX, topY, beamX, topY);
  // 4) верёвка
  if (step >= 4) line(beamX, topY, beamX, topY + 40);
  // 5) голова
  if (step >= 5) circle(beamX, topY + 60, 20);
  // 6) туловище
  if (step >= 6) line(beamX, topY + 80, beamX, topY + 140);
  // 7) левая рука
  if (step >= 7) line(beamX, topY + 90, beamX - 30, topY + 115);
  // 8) правая рука
  if (step >= 8) line(beamX, topY + 90, beamX + 30, topY + 115);
  // 9) левая нога
  if (step >= 9) line(beamX, topY + 140, beamX - 20, topY + 180);
  // 10) правая нога
  if (step >= 10) line(beamX, topY + 140, beamX + 20, topY + 180);
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

// Первичная отрисовка
drawHangman(0);


document.addEventListener('keydown', (e) => {
  if (screens.w2.classList.contains('active')) {
    const ch = e.key.toLowerCase();
    if (ALPHABET.includes(ch)) {
      const btns = keyboardDiv.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent === ch && !btn.disabled) {
          onGuess(ch, btn);
          break;
        }
      }
    }
  }
});
