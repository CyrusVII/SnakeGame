// Seleziona l'elemento canvas e il contesto 2D
const gameBoard = document.querySelector('#gameBoard');
const ctx = gameBoard.getContext("2d");

// Seleziona gli elementi del dom
const scoreText = document.querySelector('#scoreText');
const resetBtn = document.querySelector('#resetBtn');
const bestScore = document.querySelector('#bestScore');

// Ottiene la larghezza e l'altezza del canvas
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

// Definisce i colori per lo sfondo, il serpente e il cibo
const boardBackground = 'white';
const snakeColor = 'lightgreen';
const snakeBorder = 'black';
const foodColor = 'red';
const unitSize = 25; // Definisce la dimensione di ogni unità del serpente e del cibo

// Variabili di stato del gioco
let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let gameVelocity = 100;
let foodX;
let foodY;
let score = 0;

// Inizializza la posizione del serpente
let snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 }
];

// Ascolta gli eventi di pressione dei tasti e del pulsante di reset
window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

// Avvia il gioco
gameStart();

// Set best score text
function upTextBestScore() {
    const bestScoreRaw = localStorage.getItem('bestScore');
    if (bestScoreRaw) {
        let bScore = JSON.parse(bestScoreRaw);
        bestScore.textContent = bScore;
        console.log('Best score set to:', bScore);
    } else {
        console.log('No best score found in localStorage.');
    }
}

// Local storage best score update
function updateBestScore(score) {
    let currentBest = localStorage.getItem('bestScore');
    if (parseInt(currentBest) < score) {
        localStorage.setItem('bestScore', score);
        upTextBestScore();
        console.log('Best score updated to:', score);
    } else if (!currentBest){
        localStorage.setItem('bestScore', score);
        upTextBestScore();
        console.log('Current best score remains:', currentBest);
    }
}

function gameStart() {
    running = true;
    scoreText.textContent = score; // Imposta il punteggio iniziale
    createFood(); // Crea il cibo per il serpente
    drawFood(); // Disegna il cibo sul canvas
    nextTick(); // Avvia il ciclo di aggiornamento del gioco
    upTextBestScore(); // Aggiorna il best score text
}

function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard(); // Pulisce la lavagna
            drawFood(); // Disegna nuovamente il cibo
            moveSnake(); // Muove il serpente
            drawSnake(); // Disegna il serpente
            checkCollision(); // Controlla collisioni
            checkGameOver(); // Controlla se il gioco è finito
            nextTick(); // Ripete il ciclo
        }, gameVelocity);
    } else {
        displayGameOver(); // Mostra la schermata di game over
    }
}

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight); // Pulisce l'intero canvas
}

function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize); // Assicura che il cibo sia posizionato all'interno dei limiti del canvas
    foodY = randomFood(0, gameHeight - unitSize); // Assicura che il cibo sia posizionato all'interno dei limiti del canvas
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize); // Disegna il cibo sul canvas
}

function incrementVelocity() {
    if (score % 10 == 0 && score < 30) {
        gameVelocity -= 10;
        console.log(gameVelocity);
    }
}

function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity }; // Calcola la nuova posizione della testa del serpente

    snake.unshift(head); // Aggiunge la nuova testa al serpente
    // Se il serpente mangia il cibo
    if (snake[0].x == foodX && snake[0].y == foodY) {
        score += 1; // Incrementa il punteggio
        scoreText.textContent = score; // Aggiorna il punteggio visualizzato
        incrementVelocity(); // Aumenta la velocità del gioco
        createFood(); // Crea nuovo cibo
    } else {
        snake.pop(); // Rimuove l'ultima parte del serpente
    }
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize); // Disegna ogni parte del serpente
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize); // Disegna il bordo di ogni parte del serpente
    })
}

function checkCollision() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            running = false; // Ferma il gioco se il serpente si scontra con se stesso
        }
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);

    switch (true) {
        case (keyPressed == LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed == RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
}

function checkGameOver() {
    switch (true) {
        case (snake[0].x < 0):
        case (snake[0].x >= gameWidth):
        case (snake[0].y < 0):
        case (snake[0].y >= gameHeight):
            updateBestScore(score); // Pass the current score
            running = false; // Ferma il gioco se il serpente esce dai limiti del canvas
            break;
    }
}

function displayGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", gameWidth / 2, gameHeight / 2); // Mostra il messaggio di game over
}

function resetGame() {
    score = 0; // Resetta il punteggio
    gameVelocity = 100;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: unitSize, y: 0 },
        { x: 0, y: 0 }
    ];
    gameStart(); // Riavvia il gioco
}
