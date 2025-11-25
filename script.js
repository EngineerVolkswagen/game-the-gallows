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
  const btnNewGame = document.getElementById('newGame');
  
  // Игровые данные
  let secret = '';
  let revealed = [];
  let attempts = 10;
  
  const ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split("");
  
  // Категории слов (примерные списки)
  const WORDS = {
    animals: ["тигр","лев","волк","медведь","енот","панда","слон","жираф","лисица","сокол","кабан","косуля","сурок","бобр","барсук"],
    cities: ["минск","москва","брест","гродно","витебск","могилёв","париж","рим","берлин","киев","варшава","вильнюс","рига","тбилиси","алматы"],
    tech: ["сервер","алгоритм","браузер","процессор","память","интерфейс","протокол","контейнер","скрипт","драйвер","компилятор","модуль","кэш","сокет","датчик"],
    mixed: ["бургер","пицца","суп","плов","котлета","шеф","врач","пекарь","слесарь","ювелир","шахтёр","плотник","инженер","пилот","повар"]
  };
  const ALL_WORDS = [...WORDS.animals, ...WORDS.cities, ...WORDS.tech, ...WORDS.mixed];
  
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
    drawHangman(0);
  }
  
  // Рендер слова (правильные буквы на местах)
  function renderWord() {
    wordDiv.innerHTML = '';
    for (let i = 0; i < secret.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'letter';
      cell.textContent = revealed[i] ? secret[i] : '';
      wordDiv.appendChild(cell);
    }
  }
  
  // Рендер алфавита (кнопки блокируются при нажатии)
  function renderKeyboard() {
    keyboardDiv.innerHTML = '';
    ALPHABET.forEach(ch => {
      const btn = document.createElement('button');
      btn.textContent = ch;
      btn.addEventListener('click', () => onGuess(ch, btn));
      keyboardDiv.appendChild(btn);
    });
  }
  
  // Логика угадывания
  function onGuess(ch, btn) {
    btn.disabled = true;
  
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
      const step = 10 - attempts; // шаг рисования
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
      showScreen('window3');
    } else if (lost) {
      resultTitle.textContent = `Поражение! Слово было: ${secret}`;
      showScreen('window3');
    }
  }
  
  // Вспомогательные функции
  function pickRandom(list) {
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }
  
  // Оставляем только русские буквы (включая ё)
  function normalizeWord(w) {
    const valid = w.replace(/[^а-яё]/g, '');
    return valid;
  }
  
  /*
    Рисование "Виселицы":
    10 шагов (каждый неверный ответ добавляет элемент):
    1 — основание, 2 — стойка, 3 — перекладина, 4 — распорка,
    5 — верёвка, 6 — голова, 7 — туловище, 8 — левая рука,
    9 — правая рука, 10 — левая нога + правая нога.
  */
  
  function drawHangman(step = 0) {
    // очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
  
    // координаты
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
  
    // 4) распорка (диагональ)
    if (step >= 4) line(baseX + 2, topY + 2, baseX + 24, topY + 40);
  
    // 5) верёвка
    if (step >= 5) line(beamX, topY, beamX, topY + 40);
  
    // 6) голова
    if (step >= 6) circle(beamX, topY + 60, 20);
  
    // 7) туловище
    if (step >= 7) line(beamX, topY + 80, beamX, topY + 140);
  
    // 8) левая рука
    if (step >= 8) line(beamX, topY + 90, beamX - 30, topY + 115);
  
    // 9) правая рука
    if (step >= 9) line(beamX, topY + 90, beamX + 30, topY + 115);
  
    // 10) две ноги сразу (чтобы уложиться в 10 шагов)
    if (step >= 10) {
      line(beamX, topY + 140, beamX - 20, topY + 180); // левая нога
      line(beamX, topY + 140, beamX + 20, topY + 180); // правая нога
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
  
  // Первичная отрисовка (на всякий случай)
  drawHangman(0);
  