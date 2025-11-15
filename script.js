// DOM Elements
const choiceButtons = document.querySelectorAll('.choice-btn');
const choicesContainer = document.querySelector('.choices');
const winScoreElem = document.getElementById('win-score');
const lossScoreElem = document.getElementById('loss-score');
const drawScoreElem = document.getElementById('draw-score');
const resultTextElem = document.getElementById('result-text');
const playerChoiceDisplay = document.getElementById('player-choice-display');
const computerChoiceDisplay = document.getElementById('computer-choice-display');
const resetButton = document.getElementById('reset-btn');

// Emojis for choices
const EMOJIS = { "Snake": "🐍", "Water": "💧", "Gun": "🔫" };

// Score tracker
let score = { win: 0, lose: 0, draw: 0 };

// --- EVENT LISTENERS ---
choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        const playerChoiceName = button.dataset.choice;
        playRound(playerChoiceName);
    });
});

resetButton.addEventListener('click', resetGame);

// --- GAME LOGIC ---
async function playRound(playerChoiceName) {
    // 1. Preparation Phase
    choicesContainer.classList.add('disabled');
    playerChoiceDisplay.classList.remove('active');
    computerChoiceDisplay.classList.remove('active');
    playerChoiceDisplay.innerHTML = `<span>?</span>`;
    computerChoiceDisplay.innerHTML = `<span>?</span>`;
    resultTextElem.textContent = "Computer is choosing...";

    try {
        // 2. API Call Phase
        const response = await fetch('http://127.0.0.1:5000/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choice: playerChoiceName })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // 3. Reveal Phase
        setTimeout(() => {
            // Display choices with emojis
            playerChoiceDisplay.innerHTML = EMOJIS[data.playerChoice];
            computerChoiceDisplay.innerHTML = EMOJIS[data.computerChoice];
            playerChoiceDisplay.classList.add('active');
            computerChoiceDisplay.classList.add('active');

            setTimeout(() => {
                updateScoreAndResult(data);
                setTimeout(() => {
                    choicesContainer.classList.remove('disabled');
                }, 1000); // Re-enable buttons after a short delay
            }, 500);
        }, 750);

    } catch (error) {
        console.error("Error playing round:", error);
        resultTextElem.textContent = "Error: Could not connect to server.";
        choicesContainer.classList.remove('disabled');
    }
}

function updateScoreAndResult(data) {
    resultTextElem.textContent = data.resultText;
    let scoreElemToUpdate;

    if (data.resultCode === 1) {
        score.win++;
        winScoreElem.textContent = score.win;
        scoreElemToUpdate = winScoreElem.parentElement;
    } else if (data.resultCode === -1) {
        score.lose++;
        lossScoreElem.textContent = score.lose;
        scoreElemToUpdate = lossScoreElem.parentElement;
    } else {
        score.draw++;
        drawScoreElem.textContent = score.draw;
        scoreElemToUpdate = drawScoreElem.parentElement;
    }

    if (scoreElemToUpdate) {
        scoreElemToUpdate.classList.add('score-updated');
        setTimeout(() => scoreElemToUpdate.classList.remove('score-updated'), 500);
    }
}

function resetGame() {
    score = { win: 0, lose: 0, draw: 0 };
    winScoreElem.textContent = '0';
    lossScoreElem.textContent = '0';
    drawScoreElem.textContent = '0';
    resultTextElem.textContent = "Make Your Move!";
    playerChoiceDisplay.innerHTML = `<span>?</span>`;
    computerChoiceDisplay.innerHTML = `<span>?</span>`;
    playerChoiceDisplay.classList.remove('active');
    computerChoiceDisplay.classList.remove('active');
    choicesContainer.classList.remove('disabled');
}