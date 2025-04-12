document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const sidebar = document.getElementById("sidebar");
  const openSidebarBtn = document.getElementById("open-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");
  const mainContent = document.getElementById("main-content");
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  const mainTitle = document.getElementById("main-title");
  const instructions = document.getElementById("instructions");

  // Content Sections
  const contentSections = document.querySelectorAll(".content-section");
  const practiceSection = document.getElementById("practice-section");
  const gameSection = document.getElementById("game-section");
  const tipsSection = document.getElementById("tips-section");

  // Practice Elements
  const visualKeyboardContainer = document.getElementById("visual-keyboard");
  const textDisplayWrapper = document.getElementById("text-display-wrapper"); // Wrapper for scrolling
  const textToTypeContainer = document.getElementById("text-to-type");
  const hiddenInput = document.getElementById("hidden-input");
  const timeEl = document.getElementById("time");
  const wpmEl = document.getElementById("wpm");
  const accuracyEl = document.getElementById("accuracy");
  const errorsEl = document.getElementById("errors");
  const restartButton = document.getElementById("restart-button");

  // Game Elements
  const gameCanvas = document.getElementById("game-canvas");
  const gameInput = document.getElementById("game-input");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const startGameButton = document.getElementById("start-game-button");

  // Audio Elements
  const keypressSound = document.getElementById("keypress-sound");
  const errorSound = document.getElementById("error-sound");
  const bgMusic = document.getElementById("bg-music");

  // Settings Toggles
  const typingSoundToggle = document.getElementById("toggle-typing-sound");
  const errorSoundToggle = document.getElementById("toggle-error-sound");
  const bgMusicToggle = document.getElementById("toggle-bg-music");

  // --- State Variables ---
  let currentMode = "welcome";
  let currentLesson = "";
  let currentPractice = "";
  let textToType = "";
  let textSpans = [];
  let currentIndex = 0;
  let startTime = null;
  let timerInterval = null;
  let errors = 0;
  let typedChars = 0; // Count actual characters typed (excluding backspace action itself)
  let gameInterval = null;
  let fallingWords = [];
  let gameScore = 0;
  let gameLives = 5;
  let gameRunning = false;
  let wordFallSpeed = 1.5; // Slower speed
  let wordSpawnRate = 1800; // Slightly slower spawn

  let settings = {
    // Default settings
    typingSound: true,
    errorSound: true,
    bgMusic: false,
  };

  // --- Data ---
  const lessonsData = {
    "home-row": "asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj",
    "top-row": "qwerty uiop qwer uiopyt eruiop tyuiop qwerty",
    "bottom-row": "zxcvbnm,./ zxcv mnbv cxnm zxcvbnm ./,mnb",
    numbers: "12345 67890 13579 02468 19283 74650",
    symbols: "!@#$% ^&*()_+ -=[]\\{}|;':\",./<>? `~",
  };

  const practiceData = {
    letters: "abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz",
    words:
      "the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump coding is fun practice everyday type faster improve accuracy focus on learning javascript html css react",
    paragraph:
      "Programming involves tasks such as analysis, generating algorithms, profiling algorithms' accuracy and resource consumption, and the implementation of algorithms in a chosen programming language. The source code is written in one or more programming languages. The purpose of programming is to find a sequence of instructions that will automate the performance of a task for solving a given problem. Consistent practice is key to improving typing speed and accuracy.",
  };

  const gameWords = [
    "html",
    "css",
    "javascript",
    "python",
    "java",
    "node",
    "react",
    "angular",
    "vue",
    "code",
    "type",
    "fast",
    "keyboard",
    "practice",
    "skill",
    "develop",
    "web",
    "app",
    "game",
    "pro",
    "function",
    "variable",
    "object",
    "array",
    "loop",
    "condition",
    "class",
    "module",
    "import",
    "style",
    "element",
    "button",
    "input",
    "event",
    "listener",
    "async",
    "await",
    "promise",
    "fetch",
  ];

  // --- Keyboard Generation ---
  const keyLayout = [
    [
      "`",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "-",
      "=",
      "Backspace",
    ],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    [
      "ShiftLeft",
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      ",",
      ".",
      "/",
      "ShiftRight",
    ],
    ["Space"],
  ];

  function generateKeyboard() {
    visualKeyboardContainer.innerHTML = "";
    keyLayout.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("keyboard-row");
      row.forEach((key) => {
        const keyDiv = document.createElement("div");
        keyDiv.classList.add("key");
        keyDiv.textContent = key
          .replace("ShiftLeft", "Shift")
          .replace("ShiftRight", "Shift")
          .replace("Caps", "Caps Lock"); // Adjust display text
        keyDiv.dataset.key = getKeyData(key);

        if (key === "Space") keyDiv.classList.add("space");
        else if (key === "ShiftLeft" || key === "ShiftRight")
          keyDiv.classList.add("shift", "special");
        else if (key === "Backspace")
          keyDiv.classList.add("backspace", "special");
        else if (key === "Tab") keyDiv.classList.add("tab", "special");
        else if (key === "Enter") keyDiv.classList.add("enter", "special");
        else if (key === "Caps") keyDiv.classList.add("caps", "special");
        else if (key.length > 1) keyDiv.classList.add("special");

        rowDiv.appendChild(keyDiv);
      });
      visualKeyboardContainer.appendChild(rowDiv);
    });
  }

  function getKeyData(key) {
    switch (key) {
      case "`":
        return "`";
      case "Tab":
        return "Tab";
      case "Caps":
        return "CapsLock";
      case "ShiftLeft":
        return "Shift";
      case "ShiftRight":
        return "Shift";
      case "Space":
        return " ";
      case "Enter":
        return "Enter";
      case "Backspace":
        return "Backspace";
      case "\\":
        return "\\"; // Ensure backslash is mapped correctly
      default:
        return key.toLowerCase();
    }
  }

  function highlightKey(eventKeyOrChar, add = true) {
    let keyToFind = eventKeyOrChar;
    if (eventKeyOrChar === " ") {
      keyToFind = " ";
    } else if (eventKeyOrChar === "CapsLock") {
      keyToFind = "capslock";
    } else if (eventKeyOrChar === "Shift") {
      const shiftKeys = visualKeyboardContainer.querySelectorAll(
        `.key[data-key='shift']`
      );
      shiftKeys.forEach((k) =>
        add ? k.classList.add("active") : k.classList.remove("active")
      );
      return;
    } else {
      keyToFind = eventKeyOrChar.toLowerCase();
    }

    const keyElement = visualKeyboardContainer.querySelector(
      `.key[data-key='${keyToFind}']`
    );
    if (keyElement) {
      if (add) keyElement.classList.add("active");
      else keyElement.classList.remove("active");
    }
  }

  function highlightNextKey() {
    visualKeyboardContainer
      .querySelectorAll(".key.next")
      .forEach((k) => k.classList.remove("next"));
    if (currentIndex < textSpans.length) {
      let nextChar = textSpans[currentIndex].textContent;
      let dataKey = getKeyData(nextChar);
      if (
        (nextChar >= "A" && nextChar <= "Z") ||
        [
          "~",
          "!",
          "@",
          "#",
          "$",
          "%",
          "^",
          "&",
          "*",
          "(",
          ")",
          "_",
          "+",
          "{",
          "}",
          "|",
          ":",
          '"',
          "<",
          ">",
          "?",
        ].includes(nextChar)
      ) {
        const shiftKeys = visualKeyboardContainer.querySelectorAll(
          `.key[data-key='shift']`
        );
        shiftKeys.forEach((k) => k.classList.add("next"));
      }
      const keyElement = visualKeyboardContainer.querySelector(
        `.key[data-key='${dataKey.toLowerCase()}']`
      );
      if (keyElement) {
        keyElement.classList.add("next");
      }
    }
  }

  // --- Sidebar Logic ---
  function toggleSidebar() {
    const isOpen = sidebar.classList.contains("open");
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active", !isOpen);
    } else {
      sidebar.classList.toggle("closed");
      mainContent.style.marginLeft = sidebar.classList.contains("closed")
        ? "0"
        : "var(--sidebar-width)";
      openSidebarBtn.style.opacity = sidebar.classList.contains("closed")
        ? "1"
        : "0";
      openSidebarBtn.style.pointerEvents = sidebar.classList.contains("closed")
        ? "auto"
        : "none";
    }
  }
  openSidebarBtn.addEventListener("click", toggleSidebar);
  closeSidebarBtn.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      overlay.classList.remove("active");
      sidebar.classList.remove("open");
      mainContent.style.marginLeft = sidebar.classList.contains("closed")
        ? "0"
        : "var(--sidebar-width)";
      openSidebarBtn.style.display = "block";
      openSidebarBtn.style.opacity = sidebar.classList.contains("closed")
        ? "1"
        : "0";
      openSidebarBtn.style.pointerEvents = sidebar.classList.contains("closed")
        ? "auto"
        : "none";
    } else {
      mainContent.style.marginLeft = "0";
      openSidebarBtn.style.opacity = "1";
      openSidebarBtn.style.pointerEvents = "auto";
      if (!sidebar.classList.contains("open")) {
        sidebar.classList.add("closed");
        sidebar.classList.remove("open");
      }
    }
  });

  // --- Mode Switching ---
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const mode = link.dataset.mode;
      if (!mode) return;

      setActiveLink(link);
      if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
        toggleSidebar();
      }

      resetPracticeState();
      stopGame();

      console.log("--- Link Clicked --- Mode:", mode); // Debug
      console.log("Hiding all sections..."); // Debug
      // --- HIDE ALL SECTIONS ---
      contentSections.forEach((section) => {
        section.classList.remove("active");
        console.log(`Removed active from ${section.id}`); // Debug
      });

      hiddenInput.blur(); // Unfocus typing input

      console.log(`Activating mode: ${mode}`); // Debug
      // --- SHOW THE TARGET SECTION ---
      if (mode === "lesson" || mode === "practice") {
        currentMode = mode;
        let textToLoad = "";
        let newInstructions = "";
        if (mode === "lesson") {
          currentLesson = link.dataset.lesson;
          mainTitle.textContent = `Lesson: ${link.textContent.trim()}`;
          newInstructions =
            "Type the characters shown below. Focus on accuracy and finger placement.";
          textToLoad = lessonsData[currentLesson] || "Lesson text not found.";
        } else {
          currentPractice = link.dataset.practice;
          mainTitle.textContent = `Practice: ${link.textContent.trim()}`;
          newInstructions = `Practice typing ${currentPractice}. Press any key to start the timer.`;
          textToLoad =
            practiceData[currentPractice] || "Practice text not found.";
        }
        instructions.textContent = newInstructions;
        loadText(textToLoad);
        practiceSection.classList.add("active");
        if (textSpans.length > 0) hiddenInput.focus(); // Focus only if text loaded & ready
      } else if (mode === "game") {
        currentMode = "game";
        mainTitle.textContent = `Game: Falling Words`;
        instructions.textContent =
          "Type the falling words before they reach the bottom!";
        prepareGame();
        gameSection.classList.add("active");
      } else if (mode === "tips") {
        currentMode = "tips";
        mainTitle.textContent = `Typing Tips`;
        instructions.textContent =
          "Improve your typing skills with these helpful tips.";
        tipsSection.classList.add("active");
      }
    });
  });

  function setActiveLink(activeLink) {
    sidebarLinks.forEach((link) => link.classList.remove("active"));
    activeLink.classList.add("active");
  }

  // --- Practice Logic ---
  function loadText(text) {
    resetPracticeState(); // Reset first
    textToType = text;
    textToTypeContainer.innerHTML = "";
    textSpans = text.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      textToTypeContainer.appendChild(span);
      return span;
    });
    if (textSpans.length > 0) {
      textSpans[0].classList.add("current");
      highlightNextKey();
    }
    textDisplayWrapper.scrollTop = 0; // Ensure scroll top
  }

  function handleKeyPress(e) {
    if (!practiceSection.classList.contains("active")) return;
    if (
      document.activeElement === gameInput ||
      e.target.classList.contains("slider")
    )
      return;

    const pressedKey = e.key;
    if ([" ", "Backspace", "Tab"].includes(pressedKey)) {
      e.preventDefault();
    }
    if (currentIndex >= textSpans.length) {
      playErrorSound();
      return;
    }

    if (
      !startTime &&
      pressedKey.length === 1 &&
      ![
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "Enter",
        "Escape",
      ].includes(pressedKey)
    ) {
      startTimer();
    }

    highlightKey(pressedKey, true);
    setTimeout(() => highlightKey(pressedKey, false), 100);

    if (pressedKey === "Backspace") {
      if (currentIndex > 0) {
        playKeySound();
        currentIndex--;
        textSpans[currentIndex].classList.remove(
          "correct",
          "incorrect",
          "current"
        );
        textSpans[currentIndex + 1]?.classList.remove("current");
        textSpans[currentIndex].classList.add("current");
        highlightNextKey();
        scrollIntoViewIfNeeded(textSpans[currentIndex]);
      }
      updateStatsDisplay();
      return;
    }

    if (pressedKey.length > 1 && pressedKey !== "Enter") {
      if (pressedKey === "CapsLock") {
        /* Optional: Handle CapsLock visual state */
      }
      return;
    }

    const currentSpan = textSpans[currentIndex];
    const targetChar = currentSpan.textContent;

    if (pressedKey === targetChar) {
      playKeySound();
      currentSpan.classList.add("correct");
    } else {
      playErrorSound();
      currentSpan.classList.add("incorrect");
      errors++;
    }

    currentSpan.classList.remove("current");
    typedChars++;
    currentIndex++;

    if (currentIndex < textSpans.length) {
      const nextSpan = textSpans[currentIndex];
      nextSpan.classList.add("current");
      highlightNextKey();
      scrollIntoViewIfNeeded(nextSpan);
    } else {
      stopTimer();
      instructions.textContent = "Practice complete! Check your stats below.";
      highlightNextKey(); // Remove 'next' highlight
    }
    updateStatsDisplay();
  }

  function scrollIntoViewIfNeeded(element) {
    const parentRect = textDisplayWrapper.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (elementRect.top < parentRect.top) {
      textDisplayWrapper.scrollTop -= parentRect.top - elementRect.top + 5;
    } else if (elementRect.bottom > parentRect.bottom) {
      textDisplayWrapper.scrollTop +=
        elementRect.bottom - parentRect.bottom + element.offsetHeight + 5;
    }
  }

  function startTimer() {
    startTime = new Date();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    updateStatsDisplay();
  } // Final update
  function updateTimer() {
    if (!startTime) {
      timeEl.textContent = "0:00";
      return;
    }
    const now = new Date();
    const elapsedTime = Math.max(0, Math.floor((now - startTime) / 1000));
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timeEl.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    if (timerInterval) {
      updateStatsDisplay();
    } // Update stats while running
  }
  function calculateWPM() {
    if (!startTime || typedChars === 0) return 0;
    const now = new Date();
    const elapsedTimeSeconds = Math.max(1, (now - startTime) / 1000);
    const elapsedTimeMinutes = elapsedTimeSeconds / 60;
    const grossWPM = typedChars / 5 / elapsedTimeMinutes;
    return Math.max(0, Math.round(grossWPM));
  }
  function calculateAccuracy() {
    if (typedChars === 0) return 100;
    const correctChars = Math.max(0, typedChars - errors);
    return Math.max(0, Math.round((correctChars / typedChars) * 100));
  }
  function updateStatsDisplay() {
    wpmEl.textContent = startTime ? calculateWPM() : 0;
    accuracyEl.textContent = `${calculateAccuracy()}%`;
    errorsEl.textContent = errors;
  }
  function resetPracticeState() {
    stopTimer();
    startTime = null;
    currentIndex = 0;
    errors = 0;
    typedChars = 0;
    timeEl.textContent = "0:00";
    updateStatsDisplay();
    textSpans.forEach((span) =>
      span.classList.remove("correct", "incorrect", "current")
    );
    if (textSpans.length > 0) {
      textSpans[0].classList.add("current");
      highlightNextKey();
    } else {
      highlightNextKey();
    }
    textDisplayWrapper.scrollTop = 0;
    hiddenInput.value = "";
  }
  restartButton.addEventListener("click", () => {
    let textToLoad = "";
    let newInstructions = "";
    if (currentMode === "lesson" && lessonsData[currentLesson]) {
      textToLoad = lessonsData[currentLesson];
      newInstructions =
        "Type the characters shown below. Focus on accuracy and finger placement.";
    } else if (currentMode === "practice" && practiceData[currentPractice]) {
      textToLoad = practiceData[currentPractice];
      newInstructions = `Practice typing ${currentPractice}. Press any key to start the timer.`;
    }
    if (textToLoad) {
      loadText(textToLoad);
      instructions.textContent = newInstructions;
      hiddenInput.focus();
    } else {
      resetPracticeState();
      instructions.textContent = "Select a lesson or practice mode.";
    }
  });

  // --- Game Logic ---
  function prepareGame() {
    gameCanvas.innerHTML = "";
    fallingWords = [];
    gameScore = 0;
    gameLives = 5;
    gameRunning = false;
    scoreEl.textContent = gameScore;
    livesEl.textContent = gameLives;
    gameInput.value = "";
    gameInput.disabled = true;
    startGameButton.disabled = false;
    startGameButton.textContent = "Start Game";
  }
  function startGame() {
    if (gameRunning) return;
    prepareGame();
    gameRunning = true;
    gameInput.disabled = false;
    gameInput.focus();
    startGameButton.disabled = true;
    startGameButton.textContent = "Game Running...";
    gameInterval = setInterval(gameLoop, 1000 / 60);
    setTimeout(spawnWord, wordSpawnRate);
  }
  function stopGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    gameInterval = null;
    fallingWords.forEach((wordObj) => wordObj.element.remove());
    fallingWords = [];
    gameInput.disabled = true;
    startGameButton.disabled = false;
    startGameButton.textContent = "Start Game";
  }
  function spawnWord() {
    if (!gameRunning) return;
    const randomIndex = Math.floor(Math.random() * gameWords.length);
    const wordText = gameWords[randomIndex];
    const wordElement = document.createElement("div");
    wordElement.classList.add("falling-word");
    wordElement.textContent = wordText;
    const canvasWidth = gameCanvas.offsetWidth;
    const maxLeft = Math.max(0, canvasWidth - (wordText.length * 10 + 20));
    wordElement.style.left = Math.random() * maxLeft + "px";
    wordElement.style.top = "-30px";
    gameCanvas.appendChild(wordElement);
    fallingWords.push({ text: wordText, element: wordElement, y: -30 });
    setTimeout(spawnWord, wordSpawnRate * (Math.random() * 0.4 + 0.8));
  }
  function gameLoop() {
    if (!gameRunning) return;
    const canvasHeight = gameCanvas.offsetHeight;
    let missedWord = false;
    for (let i = fallingWords.length - 1; i >= 0; i--) {
      const wordObj = fallingWords[i];
      wordObj.y += wordFallSpeed;
      wordObj.element.style.top = wordObj.y + "px";
      if (wordObj.y + wordObj.element.offsetHeight >= canvasHeight) {
        wordObj.element.remove();
        fallingWords.splice(i, 1);
        gameLives--;
        missedWord = true;
      }
    }
    if (missedWord) {
      playErrorSound();
      livesEl.textContent = gameLives;
      if (gameLives <= 0) {
        gameOver();
      }
    }
  }
  function handleGameInput(e) {
    if (e.key === "Enter" && gameRunning) {
      e.preventDefault();
      const typedWord = gameInput.value.trim().toLowerCase();
      if (typedWord) {
        let wordMatched = false;
        for (let i = fallingWords.length - 1; i >= 0; i--) {
          if (fallingWords[i].text === typedWord) {
            playKeySound();
            fallingWords[i].element.remove();
            fallingWords.splice(i, 1);
            gameScore += typedWord.length;
            scoreEl.textContent = gameScore;
            wordMatched = true;
            break;
          }
        }
        if (!wordMatched) {
          playErrorSound();
          gameInput.style.animation = "shake 0.3s";
          setTimeout(() => (gameInput.style.animation = ""), 300);
        }
        gameInput.value = "";
      }
    }
  }
  function gameOver() {
    stopGame();
    mainTitle.textContent = `Game Over! Final Score: ${gameScore}`;
    instructions.textContent =
      "Select another mode or click 'Play Again?' to restart the game.";
    startGameButton.textContent = "Play Again?";
    startGameButton.disabled = false;
  }
  startGameButton.addEventListener("click", startGame);
  gameInput.addEventListener("keypress", handleGameInput);

  // --- Sound Functions ---
  function playSound(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch((error) => {
      if (error.name !== "NotAllowedError") {
        console.warn("Audio play failed:", error);
      }
    });
  }
  function playKeySound() {
    if (settings.typingSound) {
      playSound(keypressSound);
    }
  }
  function playErrorSound() {
    if (settings.errorSound) {
      playSound(errorSound);
    }
  }
  function toggleBackgroundMusic() {
    if (!bgMusic) return;
    if (settings.bgMusic) {
      bgMusic
        .play()
        .catch((error) => console.warn("BG Music play failed:", error));
    } else {
      bgMusic.pause();
    }
  }

  // --- Settings Logic ---
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem("proTyperSettings");
      if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    typingSoundToggle.checked = settings.typingSound;
    errorSoundToggle.checked = settings.errorSound;
    bgMusicToggle.checked = settings.bgMusic;
    toggleBackgroundMusic();
  }
  function saveSettings() {
    try {
      localStorage.setItem("proTyperSettings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }
  typingSoundToggle.addEventListener("change", (e) => {
    settings.typingSound = e.target.checked;
    saveSettings();
  });
  errorSoundToggle.addEventListener("change", (e) => {
    settings.errorSound = e.target.checked;
    saveSettings();
  });
  bgMusicToggle.addEventListener("change", (e) => {
    settings.bgMusic = e.target.checked;
    saveSettings();
    toggleBackgroundMusic();
  });

  // --- Event Listeners ---
  hiddenInput.addEventListener("keydown", handleKeyPress);
  textDisplayWrapper.addEventListener("click", () => {
    if (practiceSection.classList.contains("active")) {
      hiddenInput.focus();
    }
  });
  document.body.addEventListener(
    "click",
    () => {
      if (bgMusic && bgMusic.paused && settings.bgMusic) {
        toggleBackgroundMusic();
      }
    },
    { once: true }
  );

  // --- Initialization ---
  loadSettings(); // Load settings FIRST
  generateKeyboard();
  window.dispatchEvent(new Event("resize")); // Trigger initial layout setup

  // Set initial view (e.g., Tips)
  tipsSection.classList.add("active"); // Make tips active
  mainTitle.textContent = `Typing Tips`;
  instructions.textContent =
    "Improve your typing skills with these helpful tips.";
  setActiveLink(document.querySelector('a[data-mode="tips"]'));

  // Ensure others are explicitly not active on load
  practiceSection.classList.remove("active");
  gameSection.classList.remove("active");
});
