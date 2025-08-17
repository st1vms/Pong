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
let ballSpeedIncrease = 0.5;

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

let playerOneMovingUp = false;
let playerOneMovingDown = false;

let playerTwoMovingUp = false;
let playerTwoMovingDown = false;

// Used for ticks
const tickRateMs = 10;
let intervalID;

function onKeyPressed(event) {
	const keyPressed = event.keyCode;

	switch (keyPressed) {
		case playerOneUpKeyCode: {
			playerOneMovingUp = true;
			break;
		}
		case playerOneDownKeyCode: {
			playerOneMovingDown = true;
			break;
		}
		case playerTwoUpKeyCode: {
			playerTwoMovingUp = true;
			break;
		}
		case playerTwoDownKeyCode: {
			playerTwoMovingDown = true;
			break;
		}
	}
}

function onKeyReleased(event) {
	const keyPressed = event.keyCode;

	switch (keyPressed) {
		case playerOneUpKeyCode: {
			playerOneMovingUp = false;
			break;
		}
		case playerOneDownKeyCode: {
			playerOneMovingDown = false;
			break;
		}
		case playerTwoUpKeyCode: {
			playerTwoMovingUp = false;
			break;
		}
		case playerTwoDownKeyCode: {
			playerTwoMovingDown = false;
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
			// Prevents clipping
			ballX = playerOnePaddle.x + playerOnePaddle.width + ballRadius;

			// Compute collision offset
			let paddleCenter = playerOnePaddle.y + playerOnePaddle.height / 2;
			let distanceFromCenter = ballY - paddleCenter;

			// Normalize to range [-1, 1]
			let normalized = distanceFromCenter / (playerOnePaddle.height / 2);

			// Max bounce angle (radians), e.g. 60°
			let maxBounce = Math.PI / 3;

			// Compute angle
			let bounceAngle = normalized * maxBounce;

			ballXDirection = Math.cos(bounceAngle); // always positive
			ballYDirection = Math.sin(bounceAngle);

			// Make sure it goes to the right (since it bounced from left paddle)
			ballXDirection = Math.abs(ballXDirection);

			ballSpeed += ballSpeedIncrease;
		}
	}

	if (ballX >= playerTwoPaddle.x - ballRadius) {
		if (
			ballY > playerTwoPaddle.y &&
			ballY < playerTwoPaddle.y + playerTwoPaddle.height
		) {
			ballX = playerTwoPaddle.x - ballRadius;

			let paddleCenter = playerTwoPaddle.y + playerTwoPaddle.height / 2;
			let distanceFromCenter = ballY - paddleCenter;
			let normalized = distanceFromCenter / (playerTwoPaddle.height / 2);
			let maxBounce = Math.PI / 3;
			let bounceAngle = normalized * maxBounce;

			ballXDirection = Math.cos(bounceAngle);
			ballYDirection = Math.sin(bounceAngle);

			// Make sure it goes to the left (since it bounced from right paddle)
			ballXDirection = -Math.abs(ballXDirection);

			ballSpeed += ballSpeedIncrease;
		}
	}
}

function clearBoard() {
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawPaddles() {
	// Calculate player one movement
	if (playerOneMovingUp && playerOnePaddle.y > 0) {
		playerOnePaddle.y -= paddleSpeed;
	}

	if (
		playerOneMovingDown &&
		playerOnePaddle.y < canvasHeight - playerOnePaddle.height
	) {
		playerOnePaddle.y += paddleSpeed;
	}

	// Calculate player two movement
	if (playerTwoMovingUp && playerTwoPaddle.y > 0) {
		playerTwoPaddle.y -= paddleSpeed;
	}

	if (
		playerTwoMovingDown &&
		playerTwoPaddle.y < canvasHeight - playerTwoPaddle.height
	) {
		playerTwoPaddle.y += paddleSpeed;
	}

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
window.addEventListener("keydown", onKeyPressed);
window.addEventListener("keyup", onKeyReleased);

initGame();
