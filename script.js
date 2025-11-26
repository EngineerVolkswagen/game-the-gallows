const screens = {
  w1: document.getElementById('window1'),
  w2: document.getElementById('window2'),
  w3: document.getElementById('window3'),
};


const cardRandom = document.getElementById('action_center_left');
const cardInput = document.getElementById('action_center_center');
const cardCategory = document.getElementById('action_center_right');

const buttonRandomStart = cardRandom.querySelector('button');
const buttonInputStart = cardInput.querySelector('button');
const buttonCategoryStart = cardCategory.querySelector('button');
const inputSecret = document.getElementById('secretWord');
const selectCategory = document.getElementById('category');


const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDiv = document.getElementById('word');
const keyboardDiv = document.getElementById('keyboard');
const attemptsSpan = document.getElementById('attempts');


const resultTitle = document.getElementById('result');
const resultImage = document.getElementById('resultImage');
const buttonNewGame = document.getElementById('newGame');


let secret_word = '';
let revealed = [];
let attempts = 10;

const ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split("");


const WORDS = {
  bike: ["хонда","ямаха","сузуки","кавасаки","дукати","бмв","харлей","триумф","априлия","ктм"],
  cities: ["минск","москва","брест","гродно","витебск","могилёв","париж","рим","берлин","киев","варшава","вильнюс","рига","тбилиси","алматы"],
  animal: ["тигр","лев","волк","медведь","енот","панда","слон","жираф","лисица","сокол","кабан","косуля","сурок","бобр","барсук"],
  meal: ["бургер","пицца","суп","плов","котлета","шаурма","салат","роллы","стейк","хачапури","борщ","окрошка","чебурек","пельмени","вареники"],
  profession: ["шеф","врач","пекарь","слесарь","ювелир","шахтёр","плотник","инженер","пилот","повар","учитель","водитель","строитель","менеджер","дизайнер"]
};

const ALL_WORDS = [...WORDS.bike, ...WORDS.cities, ...WORDS.animal, ...WORDS.meal, ...WORDS.profession];


function showScreen(id) {
  screens.w1.classList.remove('active');
  screens.w2.classList.remove('active');
  screens.w3.classList.remove('active');
  document.getElementById(id).classList.add('active');
}


buttonRandomStart.addEventListener('click', () => {
  secret_word = pickRandom(ALL_WORDS);
  beginGame();
});


buttonInputStart.addEventListener('click', () => {
  const raw = (inputSecret.value || '').trim().toLowerCase();
  const cleaned = normalizeWord(raw);
  if (!cleaned) return;
  secret_word = cleaned;
  beginGame();
});


buttonCategoryStart.addEventListener('click', () => {
  const cat = selectCategory.value;
  const list = WORDS[cat] || ALL_WORDS;
  secret_word = pickRandom(list);
  beginGame();
});


buttonNewGame.addEventListener('click', () => {
  resetGameState();
  showScreen('window1');
});


function beginGame() {
  revealed = Array(secret_word.length).fill(false);
  attempts = 10;
  attemptsSpan.textContent = attempts;
  renderWord();
  renderKeyboard();
  drawHangman(0);
  showScreen('window2');
}


function resetGameState() {
  secret_word = '';
  revealed = [];
  attempts = 10;
  inputSecret.value = '';
  keyboardDiv.innerHTML = '';
  wordDiv.innerHTML = '';
  attemptsSpan.textContent = attempts;
  resultImage.innerHTML = ''; 
  drawHangman(0);
}


function renderWord() {
  wordDiv.innerHTML = '';
  for (let i = 0; i < secret_word.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'letter';
    cell.textContent = revealed[i] ? secret_word[i] : '';
    wordDiv.appendChild(cell);
  }
}


function renderKeyboard() {
  keyboardDiv.innerHTML = '';
  ALPHABET.forEach(ch => {
    const btn = document.createElement('button');
    btn.textContent = ch;
    btn.addEventListener('click', () => onGuess(ch, btn));
    keyboardDiv.appendChild(btn);
  });
}


function onGuess(ch, btn) {
  if (btn) {
    btn.disabled = true;
  } 
  let hit = false;
  for (let i = 0; i < secret_word.length; i++) {
    if (secret_word[i] === ch && !revealed[i]) {
      revealed[i] = true;
      hit = true;
    }
  }
  if (!hit) {
    attempts--;
    attemptsSpan.textContent = attempts;
    const step = 10 - attempts; 
    drawHangman(step);
  }
  renderWord();
  checkEnd();
}


function checkEnd() {
  const won = revealed.every(Boolean);
  const lost = attempts <= 0;

  if (won) {
    resultTitle.textContent = `Победа! Слово: ${secret_word}`;
    resultImage.innerHTML = `<img src="images/win.jpg" alt="Победа" style="margin-top:10px;margin-bottom: 10px;height:230px;width:auto;">`;
    showScreen('window3');
  } else if (lost) {
    resultTitle.textContent = `Поражение! Слово было: ${secret_word}`;
    resultImage.innerHTML = `<img src="images/lose.jpg" alt="Поражение" style="margin-top:10px; margin-bottom: 10px;height:230px;width:auto;">`;
    showScreen('window3');
  }
}


document.addEventListener('keydown', (e) => {
  if (screens.w2.classList.contains('active')) {
    const ch = e.key.toLowerCase();
    if (ALPHABET.includes(ch)) {
      const btns = keyboardDiv.querySelectorAll('button');
      for (let button of btns) {
        if (button.textContent === ch && !button.disabled) {
          onGuess(ch, button);
          break;
        }
      }
    }
  }
});


function pickRandom(list) {
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}


function normalizeWord(w) {
  return w.replace(/[^а-яё]/g, '');
}


function drawHangman(step = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';

  const baseY = 280;
  const baseX = 40;
  const beamX = 140;
  const topY = 40;

  // 1) основание
  if (step >= 1){
    line(20, baseY, 120, baseY);
  }
  // 2) стойка
  if (step >= 2){
    line(baseX, baseY, baseX, topY);
  }
  // 3) перекладина
  if (step >= 3){
    line(baseX, topY, beamX, topY);
  }
  // 4) верёвка
  if (step >= 4){
    line(beamX, topY, beamX, topY + 40);
  }
  // 5) голова
  if (step >= 5){ 
    circle(beamX, topY + 60, 20);
  }
  // 6) туловище
  if (step >= 6){
    line(beamX, topY + 80, beamX, topY + 140);
  }
  // 7) левая рука
  if (step >= 7){
    line(beamX, topY + 90, beamX - 30, topY + 115);
  }
  // 8) правая рука
  if (step >= 8){
    line(beamX, topY + 90, beamX + 30, topY + 115);
  }
  // 9) левая нога
  if (step >= 9){
    line(beamX, topY + 140, beamX - 20, topY + 180);
  }
  // 10) правая нога
  if (step >= 10){
    line(beamX, topY + 140, beamX + 20, topY + 180);
  }
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


drawHangman(0);


document.addEventListener('keydown', (e) => {
  if (screens.w2.classList.contains('active')) {
    const ch = e.key.toLowerCase();
    if (ALPHABET.includes(ch)) {
      const btns = keyboardDiv.querySelectorAll('button');
      for (let button of btns) {
        if (button.textContent === ch && !button.disabled) {
          onGuess(ch, button);
          break;
        }
      }
    }
  }
});
