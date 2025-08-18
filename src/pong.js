// Set to false to enable AI to play instead
const PLAYER_ONE_PLAYS = false;
const PLAYER_TWO_PLAYS = false;

const gameCanvas = document.querySelector("#game-canvas");
const gameScore = document.querySelector("#game-score");
const context = gameCanvas.getContext("2d");

const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;

const canvasColor = "#0d1117";

const winningScore = 10;

// Common player properties
const paddleWidth = 10;
const paddleHeight = 75;
const paddleSpeed = 5;

const paddleColor = "white";

// Ball properties
const ballColor = "white";
const ballRadius = 7.5;

// Starting speed
const startingBallSpeed = 1;
let ballSpeed = startingBallSpeed;
let ballSpeedIncrease = 0.5;
const maxBallSpeed = 10;

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
const playerOneUpKeyCode = "KeyW";
const playerOneDownKeyCode = "KeyS";

// Up-Down keys
const playerTwoUpKeyCode = "ArrowUp";
const playerTwoDownKeyCode = "ArrowDown";

let playerOneMovingUp = false;
let playerOneMovingDown = false;

let playerTwoMovingUp = false;
let playerTwoMovingDown = false;

// Used for ticks
const tickRateMs = 10;
let intervalID;

function onKeyPressed(keyCode) {
	switch (keyCode) {
		case playerOneUpKeyCode: {
			if (PLAYER_ONE_PLAYS) {
				playerOneMovingUp = true;
			}
			break;
		}
		case playerOneDownKeyCode: {
			if (PLAYER_ONE_PLAYS) {
				playerOneMovingDown = true;
			}
			break;
		}
		case playerTwoUpKeyCode: {
			if (PLAYER_TWO_PLAYS) {
				playerTwoMovingUp = true;
			}
			break;
		}
		case playerTwoDownKeyCode: {
			if (PLAYER_TWO_PLAYS) {
				playerTwoMovingDown = true;
			}
			break;
		}
	}
}

function onKeyReleased(keyCode) {
	switch (keyCode) {
		case playerOneUpKeyCode: {
			if (PLAYER_ONE_PLAYS) {
				playerOneMovingUp = false;
			}
			break;
		}
		case playerOneDownKeyCode: {
			if (PLAYER_ONE_PLAYS) {
				playerOneMovingDown = false;
			}
			break;
		}
		case playerTwoUpKeyCode: {
			if (PLAYER_TWO_PLAYS) {
				playerTwoMovingUp = false;
			}
			break;
		}
		case playerTwoDownKeyCode: {
			if (PLAYER_TWO_PLAYS) {
				playerTwoMovingDown = false;
			}
			break;
		}
	}
}

function checkCollision() {
	// Upper and lower wall collisions
	if (ballY <= ballRadius) {
		ballYDirection *= -1;
		ballY = ballRadius;
	}

	if (ballY >= canvasHeight - ballRadius) {
		ballYDirection *= -1;
		ballY = canvasHeight - ballRadius;
	}

	// Side wall collisions
	if (ballX <= 0) {
		// Player two scored
		playerTwoScore += 1;
		updateScore();
		createBall();
		return;
	}

	if (ballX >= canvasWidth) {
		// Player one scored
		playerOneScore += 1;
		updateScore();
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

			if (ballSpeed + ballSpeedIncrease <= maxBallSpeed) {
				ballSpeed += ballSpeedIncrease;
			}
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

			if (ballSpeed + ballSpeedIncrease <= maxBallSpeed) {
				ballSpeed += ballSpeedIncrease;
			}
		}
	}
}

function clearBoard() {
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
}

function calculatePlayerMovement() {
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
}

function updateScore() {
	gameScore.textContent = `${playerOneScore} - ${playerTwoScore}`;
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
    ballSpeed = startingBallSpeed;

    // Random angle between -45° and 45° or 135° and 225° depending on who serves
    let angle;
    if (playerOneScore == playerTwoScore) {
        angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45° to +45°
        if (Math.round(Math.random()) == 0) angle += Math.PI; // flip X direction
    } else if (playerOneScore > playerTwoScore) {
        angle = Math.PI - (Math.random() * Math.PI / 2 - Math.PI / 4); // towards left
    } else {
        angle = Math.random() * Math.PI / 2 - Math.PI / 4; // towards right
    }

    // Convert angle to X and Y components
    ballXDirection = Math.cos(angle);
    ballYDirection = Math.sin(angle);

    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
}

function moveBall() {
	ballX += ballSpeed * ballXDirection;
	ballY += ballSpeed * ballYDirection;
}

function drawBall() {
	context.fillStyle = ballColor;
	context.beginPath();
	context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
	context.fill();
}

let prevBallX = ballX;
let prevBallY = ballY;

function playerAIMovement() {
	const slope = (ballY - prevBallY) / (ballX - prevBallX);

	const predictionY = -slope * playerOnePaddle.x + ballY;

	prevBallX = ballX;
	prevBallY = ballY;

	// Predict ball trajectory y coordinate
	if (PLAYER_ONE_PLAYS === false && ballXDirection < 0) {
		const center = playerOnePaddle.y + playerOnePaddle.height / 2;
		playerOneMovingDown = predictionY > center + paddleSpeed;
		playerOneMovingUp = predictionY < center - paddleSpeed;
	} else if (PLAYER_TWO_PLAYS === false && ballXDirection > 0) {
		const center = playerTwoPaddle.y + playerTwoPaddle.height / 2;
		playerTwoMovingDown = predictionY > center + paddleSpeed;
		playerTwoMovingUp = predictionY < center - paddleSpeed;
	}
}

function nextTick() {
	// Runs a game ticks
	intervalID = setTimeout(() => {
		// Check for winning condition
		if (playerOneScore >= winningScore || playerTwoScore >= winningScore) {
			// Reset the game
			resetGame();

			// Stop the game
			return;
		}

		// Re-draw the board
		clearBoard();

		playerAIMovement();

		// Update players coordinates
		calculatePlayerMovement();

		// Re-draw players
		drawPaddles();

		// Update ball coordinates
		moveBall();

		// Check collisions
		checkCollision();

		// Re-draw ball
		drawBall();

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
	// Attach key events for moving paddles
	window.addEventListener("keydown", function (event) {
		onKeyPressed(event.code);
	});
	window.addEventListener("keyup", function (event) {
		onKeyReleased(event.code);
	});

	// Create the ball
	createBall();

	// Run first game tick
	nextTick();
}
