"use strict";
var _a, _b;
const words = "the quick brown fox jumps over the lazy dog".split(" ");
const wordsCount = words.length;
// Global state
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;
window.selectedGameTime = 30000;
window.gameTime = 30000;
function setupDurationButtons() {
    const buttons = document.querySelectorAll('.duration-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const time = parseInt(btn.dataset.time);
            window.selectedGameTime = time;
            window.gameTime = time;
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    buttons[1].classList.add('selected');
}
function addClass(el, name) {
    if (el)
        el.classList.add(name);
}
function removeClass(el, name) {
    if (el)
        el.classList.remove(name);
}
function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}
function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}
function getGameTime() {
    return window.selectedGameTime || 30000;
}
function newGame() {
    var _a;
    const wordsEl = document.getElementById('words');
    const infoEl = document.getElementById('info');
    if (!wordsEl || !infoEl)
        return;
    const gameTime = getGameTime();
    window.gameTime = gameTime;
    wordsEl.innerHTML = '';
    for (let i = 0; i < 200; i++) {
        wordsEl.innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    infoEl.innerText = `${gameTime / 1000}`;
    window.timer = null;
    window.gameStart = null;
    window.pauseTime = 0;
    (_a = document.getElementById('game')) === null || _a === void 0 ? void 0 : _a.focus();
}
function getWpm() {
    const words = Array.from(document.querySelectorAll('.word'));
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = Array.from(word.children);
        const incorrectLetters = letters.filter(letter => letter.classList.contains('incorrect'));
        const correctLetters = letters.filter(letter => letter.classList.contains('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
    return correctWords.length / (window.gameTime / 60000);
}
function gameOver() {
    clearInterval(window.timer);
    addClass(document.getElementById('game'), 'over');
    const result = getWpm();
    const info = document.getElementById('info');
    if (info)
        info.innerText = `WPM: ${Math.round(result)}`;
}
(_a = document.getElementById('game')) === null || _a === void 0 ? void 0 : _a.addEventListener('keyup', ev => {
    var _a;
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    if (!currentWord || document.querySelector('#game.over'))
        return;
    const expected = (currentLetter === null || currentLetter === void 0 ? void 0 : currentLetter.textContent) || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;
    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            const now = Date.now();
            if (!window.gameStart)
                window.gameStart = now;
            const elapsed = now - window.gameStart;
            const remaining = (window.gameTime - elapsed) / 1000;
            if (remaining <= 0) {
                gameOver();
            }
            else {
                document.getElementById('info').innerText = Math.ceil(remaining).toString();
            }
        }, 1000);
    }
    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling) {
                addClass(currentLetter.nextSibling, 'current');
            }
        }
        else {
            const span = document.createElement('span');
            span.className = 'letter incorrect extra';
            span.textContent = key;
            currentWord.appendChild(span);
        }
    }
    if (isSpace) {
        if (expected !== ' ') {
            const wrongs = currentWord.querySelectorAll('.letter:not(.correct)');
            wrongs.forEach(l => addClass(l, 'incorrect'));
        }
        removeClass(currentWord, 'current');
        addClass(currentWord.nextElementSibling, 'current');
        if (currentLetter)
            removeClass(currentLetter, 'current');
        addClass((_a = currentWord.nextElementSibling) === null || _a === void 0 ? void 0 : _a.firstChild, 'current');
    }
    if (isBackspace) {
        if (currentLetter && isFirstLetter) {
            const prevWord = currentWord.previousElementSibling;
            removeClass(currentWord, 'current');
            addClass(prevWord, 'current');
            removeClass(currentLetter, 'current');
            const last = prevWord === null || prevWord === void 0 ? void 0 : prevWord.lastChild;
            addClass(last, 'current');
            removeClass(last, 'correct');
            removeClass(last, 'incorrect');
        }
        else if (currentLetter && currentLetter.previousSibling) {
            removeClass(currentLetter, 'current');
            const prev = currentLetter.previousSibling;
            addClass(prev, 'current');
            removeClass(prev, 'correct');
            removeClass(prev, 'incorrect');
        }
        else if (!currentLetter) {
            const last = currentWord.lastChild;
            addClass(last, 'current');
            removeClass(last, 'correct');
            removeClass(last, 'incorrect');
        }
    }
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if (cursor && (nextLetter || nextWord)) {
        const el = nextLetter || nextWord;
        const rect = el.getBoundingClientRect();
        cursor.style.top = `${rect.top + 2}px`;
        cursor.style.left = `${nextLetter ? rect.left : rect.right}px`;
    }
});
(_b = document.getElementById('newGameBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    gameOver();
    newGame();
});
setupDurationButtons();
newGame();
