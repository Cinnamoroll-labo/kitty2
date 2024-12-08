const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const countdownElement = document.getElementById('countdown');
const resultMessage = document.getElementById('resultMessage');
const scoreDisplay = document.getElementById('scoreDisplay');

// ゲーム状態
let gameState = {
    blocks: [],
    paddle: {},
    ball: {},
    score: 0,
    isGameOver: false
};

// ゲーム初期化
function initGame() {
    // ブロック生成
    gameState.blocks = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            gameState.blocks.push({
                x: col * 60,
                y: row * 30,
                width: 55,
                height: 25,
                visible: true
            });
        }
    }

    // パドル設定
    gameState.paddle = {
        x: canvas.width / 2 - 75,
        y: canvas.height - 30,
        width: 150,
        height: 10,
        dx: 0
    };

    // ボール設定
    gameState.ball = {
        x: canvas.width / 2,
        y: canvas.height - 40,
        radius: 5,
        dx: 3,
        dy: -3
    };

    gameState.score = 0;
    gameState.isGameOver = false;
}

// カウントダウン
function startCountdown() {
    let count = 3;
    countdownElement.textContent = count;
    const countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            countdownElement.textContent = 'スタート!';
            setTimeout(() => {
                countdownElement.textContent = '';
                startGame();
            }, 1000);
            clearInterval(countdownTimer);
        }
    }, 1000);
}

// ゲーム開始
function startGame() {
    canvas.addEventListener('mousemove', movePaddle);
    requestAnimationFrame(gameLoop);
}

// パドル移動
function movePaddle(e) {
    const rect = canvas.getBoundingClientRect();
    gameState.paddle.x = e.clientX - rect.left - gameState.paddle.width / 2;

    // キャンバス境界でパドルを制限
    if (gameState.paddle.x < 0) gameState.paddle.x = 0;
    if (gameState.paddle.x + gameState.paddle.width > canvas.width) {
        gameState.paddle.x = canvas.width - gameState.paddle.width;
    }
}

// ゲームループ
function gameLoop() {
    clearCanvas();
    drawBlocks();
    drawPaddle();
    drawBall();
    moveBall();
    checkCollisions();

    if (!gameState.isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// キャンバスクリア
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ブロック描画
function drawBlocks() {
    gameState.blocks.forEach(block => {
        if (block.visible) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    });
}

// パドル描画
function drawPaddle() {
    ctx.fillStyle = 'green';
    ctx.fillRect(
        gameState.paddle.x, 
        gameState.paddle.y, 
        gameState.paddle.width, 
        gameState.paddle.height
    );
}

// ボール描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(
        gameState.ball.x, 
        gameState.ball.y, 
        gameState.ball.radius, 
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

// ボール移動
function moveBall() {
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;
}

// 衝突検出
function checkCollisions() {
    // 壁との衝突
    if (gameState.ball.x + gameState.ball.radius > canvas.width || 
        gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.dx *= -1;
    }

    // 上部との衝突
    if (gameState.ball.y - gameState.ball.radius < 0) {
        gameState.ball.dy *= -1;
    }

    // パドルとの衝突
    if (
        gameState.ball.y + gameState.ball.radius > gameState.paddle.y &&
        gameState.ball.x > gameState.paddle.x &&
        gameState.ball.x < gameState.paddle.x + gameState.paddle.width
    ) {
        gameState.ball.dy *= -1;
    }

    // ゲームオーバー判定
    if (gameState.ball.y + gameState.ball.radius > canvas.height) {
        endGame(false);
    }

    // ブロックとの衝突
    gameState.blocks.forEach(block => {
        if (block.visible) {
            if (
                gameState.ball.x > block.x &&
                gameState.ball.x < block.x + block.width &&
                gameState.ball.y > block.y &&
                gameState.ball.y < block.y + block.height
            ) {
                gameState.ball.dy *= -1;
                block.visible = false;
                gameState.score++;

                // 全ブロック破壊判定
                if (gameState.score === 50) {
                    endGame(true);
                }
            }
        }
    });
}

// ゲーム終了
function endGame(won) {
    gameState.isGameOver = true;
    canvas.removeEventListener('mousemove', movePaddle);

    gameScreen.style.display = 'none';
    resultScreen.style.display = 'flex';
    
    if (won) {
        resultMessage.textContent = 'おめでとうございます！';
    } else {
        resultMessage.textContent = 'おつかれさまでした';
    }
    scoreDisplay.textContent = `スコア: ${gameState.score}点`;
}

// イベントリスナー
document.getElementById('startButton').addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    initGame();
    startCountdown();
});

document.getElementById('restartButton').addEventListener('click', () => {
    resultScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    initGame();
    startCountdown();
});

document.getElementById('quitButton').addEventListener('click', () => {
    resultScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});