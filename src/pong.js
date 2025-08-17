const gameCanvas = document.querySelector("#game-canvas");
const context = gameCanvas.getContext("2d");

const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;

const canvasColor = "#0d1117";

// Common player properties
const paddleWidth = 10;
const paddleHeight = 75;
const paddleSpeed = 7.5;
const paddleColor = "white";

// Ball properties
const ballColor = "white";
const ballRadius = 7.5;

// Starting speed
const startingSpeed = 1;
let ballSpeed = startingSpeed;

// Ball starts centered
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;

// 1 or -1
let ballXDirection = 0;
let ballYDirection = 0;

// Horizontal margin from the wall
const paddleWallMargin = 5;

// Player One properties
let playerOneScore = 0;
let playerOnePaddle = {
	width: paddleWidth,
	height: paddleHeight,
	x: paddleWallMargin, // Player one is on the left
	y: (canvasHeight - paddleHeight) / 2, // Paddle starts centered
};

// Player Two properties
let playerTwoScore = 0;
let playerTwoPaddle = {
	width: paddleWidth,
	height: paddleHeight,
	x: canvasWidth - paddleWidth - paddleWallMargin, // Player two is on the right
	y: (canvasHeight - paddleHeight) / 2, // Paddle starts centered
};

// W-S
const playerOneUpKeyCode = 87;
const playerOneDownKeyCode = 83;

// Up-Down keys
const playerTwoUpKeyCode = 38;
const playerTwoDownKeyCode = 40;

// Used for ticks
const tickRateMs = 10;
let intervalID;

function changeDirection(event) {
	const keyPressed = event.keyCode;

	switch (keyPressed) {
		case playerOneUpKeyCode: {
			if (playerOnePaddle.y > 0) {
				playerOnePaddle.y -= paddleSpeed;
			}
			break;
		}
		case playerOneDownKeyCode: {
			if (playerOnePaddle.y < canvasHeight - playerOnePaddle.height) {
				playerOnePaddle.y += paddleSpeed;
			}
			break;
		}
		case playerTwoUpKeyCode: {
			if (playerTwoPaddle.y > 0) {
				playerTwoPaddle.y -= paddleSpeed;
			}
			break;
		}
		case playerTwoDownKeyCode: {
			if (playerTwoPaddle.y < canvasHeight - playerTwoPaddle.height) {
				playerTwoPaddle.y += paddleSpeed;
			}
			break;
		}
	}
}

function checkCollision() {
	// Upper and lower wall collisions
	if (ballY <= ballRadius) {
		ballYDirection *= -1;
	}

	if (ballY >= canvasHeight - ballRadius) {
		ballYDirection *= -1;
	}

	// Side wall collisions
	if (ballX <= 0) {
		// Player two scored
		playerTwoScore += 1;
		createBall();
		return;
	}

	if (ballX >= canvasWidth) {
		// Player one scored
		playerOneScore += 1;
		createBall();
		return;
	}

	// Ball - Paddle collisions
	if (ballX <= playerOnePaddle.x + playerOnePaddle.width + ballRadius) {
		if (
			ballY > playerOnePaddle.y &&
			ballY < playerOnePaddle.y + playerOnePaddle.height
		) {
			// Prevents ball from clipping into paddle
			ballX = playerOnePaddle.x + playerOnePaddle.width + ballRadius;

			ballXDirection *= -1;
			ballSpeed += 0.25;
		}
	}

	if (ballX >= playerTwoPaddle.x - ballRadius) {
		if (
			ballY > playerTwoPaddle.y &&
			ballY < playerTwoPaddle.y + playerTwoPaddle.height
		) {
			// Prevents ball from clipping into paddle
			ballX = playerTwoPaddle.x - ballRadius;

			ballXDirection *= -1;
			ballSpeed += 0.25;
		}
	}
}

function clearBoard() {
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawPaddles() {
	// Draw player one
	context.fillStyle = paddleColor;
	context.fillRect(
		playerOnePaddle.x,
		playerOnePaddle.y,
		playerOnePaddle.width,
		playerOnePaddle.height
	);

	// Draw player two
	context.fillStyle = paddleColor;
	context.fillRect(
		playerTwoPaddle.x,
		playerTwoPaddle.y,
		playerTwoPaddle.width,
		playerTwoPaddle.height
	);
}

function createBall() {
	// Reset starting speed
	ballSpeed = startingSpeed;

	// Choose a random starting direction
	if (Math.round(Math.random()) == 1) {
		ballXDirection = 1; // Move right
	} else {
		ballXDirection = -1; // Move left
	}

	if (Math.round(Math.random()) == 1) {
		ballYDirection = 1; // Move down
	} else {
		ballYDirection = -1; // Move up
	}

	// Center the ball in the canvas
	ballX = canvasWidth / 2;
	ballY = canvasHeight / 2;

	drawBall(ballX, ballY);
}

function moveBall() {
	ballX += ballSpeed * ballXDirection;
	ballY += ballSpeed * ballYDirection;
}

function drawBall(_ballX, _ballY) {
	context.fillStyle = ballColor;
	context.beginPath();
	context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
	context.fill();
}

function nextTick() {
	// Runs a game ticks
	intervalID = setTimeout(() => {
		// Reset the board
		clearBoard();

		// Redraw paddles
		drawPaddles();

		// Update ball position and draw it
		moveBall();
		drawBall(ballX, ballY);

		// Check collisions
		checkCollision();

		// Schedule next tick
		nextTick();
	}, tickRateMs);
}

function resetGame() {
	// Reset scores
	playerOneScore = 0;
	playerTwoScore = 0;

	// Reset player status
	playerOnePaddle = {
		width: paddleWidth,
		height: paddleHeight,
		x: paddleWallMargin,
		y: (canvasHeight - paddleHeight) / 2,
	};

	playerTwoPaddle = {
		width: paddleWidth,
		height: paddleHeight,
		x: canvasWidth - paddleWidth - paddleWallMargin,
		y: (canvasHeight - paddleHeight) / 2,
	};
}

function initGame() {
	// Create the ball
	createBall();

	// Run first game tick
	nextTick();
}

// Attach key events for moving paddles
window.addEventListener("keydown", changeDirection);

initGame();
